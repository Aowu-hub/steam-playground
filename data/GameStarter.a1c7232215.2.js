
/* ================= ① CONFIG — 🧩 the ONE block a new game edits first (new_game.py fills it) ================= */
const GAME_ID = 'starter';            // GameID (Games tab · LEVEL_GAMES · boards · UI.KINDS · GameCovers block · 🎭 block)
const GAME_NAME = 'Star Catch';
const GAME_ICON = '⭐';
const GAME_VERSION = '1.0';           // shown on the cover footer — bump with each round of your game
const GAME_GOAL = 'Catch the falling stars — jump for the big ones!';   // one line kids read (cover story + setup)
const MOOD_FAMILY = 'climb';          // 🎵 UiKit mood family until the 🎵 lane gives your game its own recipe (think · detective · climb · arena · story · board · sport)
const DEMO = GAME_ID === 'starter';   // the starter itself never writes to the Sheet (no Games-tab row); a real game saves with saveLevelResult
// 🧩 loader + ❓ card: registered at runtime until the ✨ UiKit lane moves them into UiKit (rule "A new game while UiKit is another lane's")
if(window.UI && UI.KINDS && !UI.KINDS[GAME_ID]) UI.KINDS[GAME_ID] = [GAME_ICON, 'Lighting up the stars', 'a-bounce'];
if(window.UI && UI.GAME_HELP && !UI.GAME_HELP[GAME_ID]) UI.GAME_HELP[GAME_ID] = ['Catch the falling stars before they hit the grass.',
  'Move with ◀ ▶ (or drag, or the arrow keys). Stars land in your hands by themselves; jump ⤴ (Space) for the big 🌟. Dodge the 🌧️ rain drops.',
  'Watch the glowing ring on the grass — that is where the next star lands.'];

const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});   // loader + menus in the player's look before the server answers
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const $ = id => document.getElementById(id);
const stClamp = (v, a, b) => Math.max(a, Math.min(b, v));   // (AvatarKit already owns `clamp`, `rnd`, `emo`, `shade` … — never redeclare them)
const S = {players: [], progress: {}, settings: {}, avatars: {}, player: '', age: ''};
let G = null, rafId = 0, lockHandle = null;
['t-icon'].forEach(id => { const e = $(id); if(e) e.textContent = GAME_ICON; }); ['t-name', 'm-name'].forEach(id => { const e = $(id); if(e) e.textContent = GAME_NAME; }); $('m-goal').textContent = GAME_GOAL;

/* ================= ② LEVELS + MAPS + MODES — 🧩 your game's numbers ================= */
// 6 levels in every main game (Basic · Junior · Intermediate · Hard · Extreme · 💀 Hardcore). 🌱 Basic = guided, no timer, no way to lose.
const LEVELS = [
  {name: 'Basic', emoji: '🌱', goal: 8, hearts: 3, fall: 1.15, gap: [1.6, 2.2], big: 0, rain: 0, cols: 5, guided: true, blurb: 'Stars wait for you'},
  {name: 'Junior', emoji: '🐣', goal: 12, hearts: 3, fall: 1.5, gap: [1.3, 1.9], big: 0.1, rain: 0.08, cols: 5, blurb: 'A few big stars to jump for'},
  {name: 'Intermediate', emoji: '🔦', goal: 16, hearts: 3, fall: 1.9, gap: [1.1, 1.6], big: 0.14, rain: 0.14, cols: 7, blurb: 'Rain drops — dodge them!'},
  {name: 'Hard', emoji: '⚡', goal: 20, hearts: 2, fall: 2.3, gap: [0.9, 1.4], big: 0.18, rain: 0.2, cols: 7, blurb: 'Faster stars, more rain'},
  {name: 'Extreme', emoji: '🌋', goal: 24, hearts: 2, fall: 2.7, gap: [0.75, 1.2], big: 0.22, rain: 0.26, cols: 9, blurb: 'A star shower!'},
  {name: 'Hardcore', emoji: '💀', goal: 24, hearts: 1, fall: 3.0, gap: [0.7, 1.05], big: 0.24, rain: 0.3, cols: 9, hardcore: true, mult: 3, blurb: '1 heart, points ×3'}
];
// 🗺️ map size → difficulty (P3e rule): size cards FIRST, a "Level size" card keeps old records comparable; points × size
const MAP_SIZES = [
  {k: 'std', icon: '🎚️', name: 'Level size', sub: 'The level\'s own field'},
  {k: 's', icon: '🌱', name: 'Small', cols: 5, mult: 1, sub: '5 lanes · ×1'},
  {k: 'm', icon: '🌳', name: 'Medium', cols: 7, mult: 1.25, sub: '7 lanes · ×1.25'},
  {k: 'l', icon: '🌲', name: 'Large', cols: 9, mult: 1.5, sub: '9 lanes · ×1.5'},
  {k: 'xl', icon: '🏔️', name: 'Huge', cols: 11, mult: 2, sub: '11 lanes · ×2'}
];
const MULT_OF_COLS = {5: 1, 7: 1.25, 9: 1.5, 11: 2};
function levelFor(i, sizeKey){
  const L = Object.assign({}, LEVELS[i]), M = MAP_SIZES.find(m => m.k === sizeKey) || MAP_SIZES[0], std = M.k === 'std';
  L.cols = std ? L.cols : M.cols; L.size = std ? 'std' : M.k; L.std = std; L.sizeMult = MULT_OF_COLS[L.cols] || 1;
  L.theme = L.cols + ' lanes'; return L;   // the size goes in the Archive Theme column ("7 lanes") → no server change
}
// 🗂️ modes in groups by TYPE (mg-1 / mc-1): 2+ boxes, each card = icon · name · type · one-line rule. A game with 3+ modes also needs
// MODES_ + MODE_GROUPS_ rows in GameData.gs (new_game.py writes them).
const MODE_GROUPS = [{k: 'solo', icon: '🎮', en: 'Solo play', th: 'เล่นคนเดียว', c: '#7C5CFF'}, {k: 'vs', icon: '⚔️', en: 'With a robot', th: 'แข่งกับหุ่นยนต์', c: '#FF8A3D'}];
const MODES = [
  {k: 'classic', g: 'solo', icon: '⭐', name: 'Star Catch', type: 'A catching game', sub: 'Catch the goal number of stars'},
  {k: 'race', g: 'vs', icon: '🤖', name: 'Robot Race', type: 'A race', sub: 'Catch more stars than the robot in 1 minute'}
];
window.MODE_TYPE = {classic: 'A catching game', race: 'A race'};
const ROBOTS = [{k: 0, icon: '🐢', name: 'Sleepy bot'}, {k: 1, icon: '🙂', name: 'Quick bot'}, {k: 2, icon: '🚀', name: 'Pro bot'}];

/* ================= ③ ENGINE — DOM-free, fixed 120 Hz steps, seeded (node tests load it: // ENGINE START … END) ================= */
// ENGINE START
const ENG = (function(){
  const DT = 1 / 120, ROWS = 6.2, HAND = ROWS - 1.45, REACH = 0.62, JT = 0.62, JUMP_H = 1.55, BIG_Y = ROWS - 2.85, RUN = 4.6, HOVER = 3.4, RACE_SEC = 60;
  const rng = seed => () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  function newMatch(cfg){
    const L = cfg.mode === 'race' ? Object.assign({}, cfg.L, {guided: false}) : cfg.L, cols = L.cols, R = rng((cfg.seed >>> 0) || 1);   // 🌱 waiting stars = solo only
    const M = {L, cols, rows: ROWS, mode: cfg.mode || 'classic', t: 0, R, items: [], nextId: 1, spawnT: 0.9, lastLane: -1,
      p: {x: cols / 2, dir: 0, target: null, jt: -1, inv: 0, caught: 0, big: 0, hearts: L.hearts, hit: 0, streak: 0, best: 0, score: 0},
      bot: null, events: [], over: false, cleared: false, started: false, ev: [], left: null};
    if(M.mode === 'race'){ const sk = cfg.robot || 0; M.bot = {x: cols / 2 + 1.2, dir: 0, target: null, jt: -1, inv: 0, caught: 0, big: 0, hearts: 99, streak: 0, best: 0, score: 0,
      speed: [2.4, 3.3, 4.3][sk], think: [0.45, 0.25, 0.1][sk], wait: 0, skill: sk}; M.left = RACE_SEC; }
    return M;
  }
  function input(M, who, o){ const P = who === 'bot' ? M.bot : M.p; if(!P || M.over) return;
    if('dir' in o){ P.dir = o.dir; if(o.dir) P.target = null; }
    if('target' in o) P.target = o.target == null ? null : stc(o.target, 0.5, M.cols - 0.5);
    if(o.jump && P.jt < 0){ P.jt = 0; const first = M.t + (M.inTick ? 0 : DT); M.events.push({type: 'jump', who, t: M.t, apexT: first + (Math.ceil(JT / 2 / DT - 1e-9) - 1) * DT}); }   // apex = the exact tick the jump peaks (a jump asked for inside a tick starts rising in that tick)
  }
  const stc = (v, a, b) => Math.max(a, Math.min(b, v));
  function spawn(M){
    const L = M.L, R = M.R; let lane = Math.floor(R() * M.cols); if(lane === M.lastLane && M.cols > 3) lane = (lane + 1 + Math.floor(R() * (M.cols - 1))) % M.cols; M.lastLane = lane;
    const roll = R(), early = M.t < 3;
    const kind = !early && roll < L.rain ? 'rain' : roll < L.rain + L.big && !early ? 'big' : 'star';
    M.items.push({id: M.nextId++, kind, x: lane + 0.5, y: -0.4, py: -0.4, v: L.fall * (kind === 'rain' ? 1.25 : kind === 'big' ? 0.9 : 1), hover: 0, wait: false, born: M.t});
  }
  function move(M, P, dt){
    let dir = P.dir; if(P.target != null){ const d = P.target - P.x; dir = Math.abs(d) < 0.05 ? 0 : Math.sign(d); if(Math.abs(d) < RUN * dt){ P.x = P.target; dir = 0; } }
    P.x = stc(P.x + dir * RUN * (P === M.bot ? P.speed / RUN : 1) * dt, 0.5, M.cols - 0.5); P.moving = dir !== 0;
    if(P.jt >= 0){ const was = P.jt; P.jt += dt; if(was < JT / 2 && P.jt >= JT / 2) P.apex = true; if(P.jt >= JT) P.jt = -1; }
    P.inv = Math.max(0, P.inv - dt);
  }
  const lift = P => P.jt >= 0 ? JUMP_H * 4 * (P.jt / JT) * (1 - P.jt / JT) : 0;
  function botThink(M, dt){
    const B = M.bot; if(!B) return; B.wait -= dt; if(B.wait > 0) return; B.wait = B.think;
    let best = null, bt = 1e9;
    M.items.forEach(it => { if(it.kind === 'rain') return; const ty = it.kind === 'big' ? BIG_Y : HAND, tArr = (ty - it.y) / Math.max(0.1, it.v) + (it.kind === 'big' ? 0.3 : 0);
      const tRun = Math.abs(it.x - B.x) / B.speed; if(tRun <= tArr + (it.kind === 'big' ? it.hover + HOVER - 0.4 : 0) && tArr < bt){ bt = tArr; best = it; } });
    B.target = best ? best.x : null; B.dir = 0; B.want = best;
    const rain = M.items.find(it => it.kind === 'rain' && Math.abs(it.x - B.x) < 0.5 && it.y > HAND - 1.6 && it.y < HAND); if(rain){ B.target = stc(B.x + (B.x > M.cols / 2 ? -1 : 1), 0.5, M.cols - 0.5); }
    if(best && best.kind === 'big' && best.hover > 0 && Math.abs(best.x - B.x) < 0.3 && B.jt < 0) input(M, 'bot', {jump: true});
  }
  function score(M, P, pts){ P.score += Math.round(pts * (M.L.sizeMult || 1) * (M.L.mult || 1)); }
  function catcher(M, it, reach){   // contested stars: the nearer catcher gets it (ties → the player)
    const C = [['me', M.p], ['bot', M.bot]].filter(c => c[1] && Math.abs(it.x - c[1].x) <= reach); if(!C.length) return null;
    C.sort((a, b) => Math.abs(it.x - a[1].x) - Math.abs(it.x - b[1].x)); return C[0];
  }
  function tick(M, dt){
    if(M.over) return; M.t += dt; M.started = true; M.inTick = true;
    move(M, M.p, dt); if(M.bot){ botThink(M, dt); move(M, M.bot, dt); }
    M.spawnT -= dt; const L = M.L;
    if(M.spawnT <= 0 && !(L.guided && M.items.some(it => it.kind === 'star'))){ spawn(M); M.spawnT = L.gap[0] + M.R() * (L.gap[1] - L.gap[0]); }
    for(const it of M.items.slice()){
      it.py = it.y;
      if(it.kind === 'big'){ if(it.y < BIG_Y){ it.y = Math.min(BIG_Y, it.y + it.v * dt); } else { it.hover += dt; if(it.hover > HOVER){ it.gone = true; M.events.push({type: 'away', id: it.id, t: M.t}); } } }
      else if(it.kind === 'star' && L.guided){   // 🌱 Basic: the star WAITS just above the hands until you walk under it (no timer, no misses)
        const stop = HAND - 0.4; if(it.y < stop || Math.abs(it.x - M.p.x) <= REACH){ it.y += it.v * dt; it.wait = false; } else { it.y = stop; it.wait = true; } }
      else it.y += it.v * dt;
      if(it.gone){ M.items.splice(M.items.indexOf(it), 1); continue; }
      if(it.kind === 'star' && it.py < HAND && it.y >= HAND){
        const c = catcher(M, it, REACH);
        if(c){ const P = c[1]; P.caught++; P.streak++; P.best = Math.max(P.best, P.streak); score(M, P, 10 + (P.streak >= 5 ? 2 : 0));
          M.events.push({type: 'catch', who: c[0], id: it.id, kind: 'star', t: M.t, x: it.x, streak: P.streak}); M.items.splice(M.items.indexOf(it), 1); continue; }
      }
      if(it.kind === 'rain' && it.py < HAND && it.y >= HAND){
        [['me', M.p], ['bot', M.bot]].forEach(([w, P]) => { if(P && Math.abs(it.x - P.x) <= 0.45 && lift(P) < 0.6 && P.inv <= 0){ P.inv = 1.2; P.streak = 0; P.hit++; if(w === 'me') P.hearts--;
          M.events.push({type: 'hit', who: w, id: it.id, t: M.t, x: it.x}); } });
      }
      if(it.y > ROWS + 0.3){ M.items.splice(M.items.indexOf(it), 1); if(it.kind === 'star'){ M.p.streak = 0; M.events.push({type: 'miss', id: it.id, t: M.t, x: it.x}); } }
    }
    [['me', M.p], ['bot', M.bot]].forEach(([w, P]) => { if(!P || !P.apex) return; P.apex = false;   // 🌟 a big star is caught only at the TOP of a leap (= the act's contact)
      const it = M.items.find(b => b.kind === 'big' && b.y >= BIG_Y - 0.25 && Math.abs(b.x - P.x) <= REACH * 1.25);
      if(it){ P.big++; P.streak++; P.best = Math.max(P.best, P.streak); score(M, P, 30); M.items.splice(M.items.indexOf(it), 1); M.events.push({type: 'catch', who: w, id: it.id, kind: 'big', t: M.t, x: it.x, streak: P.streak}); } });
    if(M.mode === 'classic'){
      if(M.p.caught + M.p.big >= L.goal){ M.over = true; M.cleared = true; M.events.push({type: 'goal', t: M.t}); }
      else if(M.p.hearts <= 0){ M.over = true; M.events.push({type: 'lost', t: M.t}); }
    } else {
      M.left = Math.max(0, M.left - dt);
      if(M.p.hearts <= 0 || M.left <= 0){ M.over = true; M.cleared = M.p.hearts > 0 && (M.p.caught + M.p.big) >= (M.bot.caught + M.bot.big); M.events.push({type: M.cleared ? 'goal' : 'lost', t: M.t}); }
    }
    M.inTick = false;
  }
  function step(M, dt){ M.acc = (M.acc || 0) + dt; let n = 0; while(M.acc >= DT && n < 30){ tick(M, DT); M.acc -= DT; n++; } }
  function takeEvents(M){ const e = M.events; M.events = []; return e; }
  // a careful auto-player for tests + balance: walks under the next star, jumps for big ones, steps away from rain
  function autoPlay(M){
    const P = M.p; let best = null, bt = 1e9;
    M.items.forEach(it => { if(it.kind === 'rain') return; const ty = it.kind === 'big' ? BIG_Y : HAND, t = (ty - it.y) / Math.max(0.1, it.v); if(t < bt && Math.abs(it.x - P.x) / RUN <= t + (it.kind === 'big' ? it.hover + HOVER - 0.3 : 0.05)){ bt = t; best = it; } });
    const rain = M.items.find(it => it.kind === 'rain' && Math.abs(it.x - P.x) < 0.55 && it.y > HAND - 1.2 && it.y < HAND);
    if(rain) input(M, 'me', {target: P.x + (P.x > M.cols / 2 ? -1 : 1)});
    else input(M, 'me', {target: best ? best.x : P.x});
    if(best && best.kind === 'big' && best.y >= BIG_Y - 0.01 && Math.abs(best.x - P.x) < 0.2 && P.jt < 0) input(M, 'me', {jump: true});
  }
  function simulate(cfg, maxSec){ const M = newMatch(cfg); while(!M.over && M.t < (maxSec || 240)){ autoPlay(M); for(let i = 0; i < 6; i++) tick(M, DT); takeEvents(M); } return M; }
  return {DT, ROWS, HAND, REACH, JT, JUMP_H, BIG_Y, RUN, HOVER, newMatch, input, step, tick, takeEvents, autoPlay, simulate, lift, rng};
})();
// ENGINE END

/* ================= ④ SETUP PAGE — cover first, then ONE page; a tap PICKS, ▶ Start names the picks ================= */
var NAV_INNER = {menu: ['◀ ' + GAME_NAME, () => openCover()]};   // the setup's top button goes back to the 🎬 cover
UI.navBar($('back-btn'), {onclick: false});
const pickKey = k => 'sp_' + GAME_ID + '_' + k + ':' + (S.player || '');
const ls = {get: k => { try{ return localStorage.getItem(pickKey(k)); }catch(e){ return null; } }, set: (k, v) => { try{ localStorage.setItem(pickKey(k), String(v)); }catch(e){} }};
const gfPick = (el, on) => { if(window.GF && GF.pick) GF.pick(el, on); };
const PICK = {mode: 'classic', size: 'std', lvl: 0, robot: 1, marks: true};
function myAvatar(name){ const a = S.avatars[name || S.player]; return a ? fixAv(a) : defaultAvatar(name || S.player || GAME_ID); }
function showScreen(name){
  ['player', 'menu', 'play'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER); window.scrollTo(0, 0);
}
function progressOf(name){
  if(DEMO){ let p = null; try{ p = JSON.parse(localStorage.getItem('sp_starter_prog:' + name) || 'null'); }catch(e){} return p || {unlocked: 0, best: []}; }
  return S.progress[name] || {unlocked: 0, tokens: [], best: []};
}
function canPlay(i){ const u = progressOf(S.player).unlocked || 0; return i === 5 ? u >= 5 : i <= u; }
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1}); b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  PICK.mode = MODES.some(m => m.k === ls.get('mode')) ? ls.get('mode') : 'classic'; PICK.size = MAP_SIZES.some(m => m.k === ls.get('size')) ? ls.get('size') : 'std';
  PICK.lvl = Number(ls.get('lvl')) || 0; if(!canPlay(PICK.lvl)) PICK.lvl = 0; PICK.robot = ls.get('robot') == null ? 1 : Number(ls.get('robot')) || 0; PICK.marks = ls.get('marks') !== '0';
  if(MODE_LINK && MODES.some(m => m.k === MODE_LINK)) PICK.mode = MODE_LINK;   // ✨ ?mode= deep link
  $('who-name').textContent = name; renderSetup(); showScreen('menu');
  if(MODE_LINK) startSetup(); else openCover();
  if(UI.guideOnce) UI.guideOnce(GAME_ID, [{icon: GAME_ICON, title: GAME_NAME, text: GAME_GOAL}], {btn: '.gf-cover:not(.gf-hide) .gf-help'});   // first time: the cover's 📖 glows
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
// 🎬 the cover (GameFrame): who's here + champions + how to play; ▶ Play opens the setup page
let Cover = null;
function openCover(){
  if(!window.GF){ showScreen('menu'); return; }
  if(Cover && Cover.who !== S.player){ Cover.destroy(); Cover = null; }
  if(!Cover){ Cover = GF.cover(document.body, {game: GAME_ID, title: GAME_NAME, icon: GAME_ICON, version: GAME_VERSION, story: GAME_GOAL, me: S.player, players: S.players, avatarOf: myAvatar,
      seats: {min: 1, max: 1}, acts: [GAME_ID + '.catch', GAME_ID + '.leap', GAME_ID + '.cheer'], backTo: WEBAPP_URL + '?page=gameroom' + sessionQuery(), backKind: 'rooms',
      onPlay: () => { Cover.hide(); showScreen('menu'); } }); Cover.who = S.player; }
  Cover.show();
}
function renderSetup(){
  // 🎮 1. modes (UI.modeGroups = the shared mode boxes)
  UI.modeGroups($('mode-box'), MODE_GROUPS, MODES.map(m => Object.assign({}, m, {on: m.k === PICK.mode})), {onPick: k => { PICK.mode = k; ls.set('mode', k); renderSetup(); return false; }});
  // 🗺️ 2. field size
  const mb = $('map-list'); mb.innerHTML = '';
  MAP_SIZES.forEach(m => { const b = document.createElement('button'); b.className = 'pick card map'; b.dataset.k = m.k; b.setAttribute('data-sound', 'pop');
    const L = levelFor(PICK.lvl, m.k);
    b.innerHTML = '<div class="big">' + m.icon + '</div><div class="nm">' + m.name + '</div><div class="sub">' + (m.k === 'std' ? L.cols + ' lanes · ×' + L.sizeMult : m.sub) + '</div>';
    b.onclick = () => { PICK.size = m.k; ls.set('size', m.k); markPicks(); }; mb.appendChild(b); });
  // 🎚️ 3. levels
  const lb = $('level-list'); lb.innerHTML = ''; const pr = progressOf(S.player);
  LEVELS.forEach((L, i) => { const open = canPlay(i), done = (pr.unlocked || 0) > i, b = document.createElement('button');
    b.className = 'pick card lvl' + (open ? '' : ' locked') + (L.hardcore ? ' hardcore' : ''); b.dataset.i = i; b.setAttribute('data-sound', open ? 'pop' : 'none');
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + L.emoji + '</div><div class="nm">' + L.name + '</div><div class="goal">' + (PICK.mode === 'race' ? '🤖 1 minute race' : 'Goal ⭐ ' + L.goal) + ' · ' + '❤️'.repeat(L.hearts) + '</div><div class="sub">' + (L.hardcore && !open ? 'Beat Extreme to open 💀' : L.blurb) + '</div>';
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Beat Extreme to open 💀 Hardcore!' : 'Clear the level before to unlock it 🔓'); return; } PICK.lvl = i; ls.set('lvl', i); renderSetup(); };
    lb.appendChild(b); });
  // 👥 4. players (who is here comes from the cover lineup; this section = HOW they play: the robot to race)
  $('players-sec').classList.toggle('hidden', PICK.mode !== 'race');
  const pb = $('players-box'); pb.innerHTML = '';
  ROBOTS.forEach(r => { const b = document.createElement('button'); b.className = 'sp-btn sp-secondary chip'; b.dataset.k = r.k; b.setAttribute('data-sound', 'pop'); b.textContent = r.icon + ' ' + r.name;
    b.onclick = () => { PICK.robot = r.k; ls.set('robot', r.k); markPicks(); }; pb.appendChild(b); });
  // ⚙️ 5. options
  const ob = $('opt-list'); ob.innerHTML = '';
  const mk = document.createElement('button'); mk.className = 'sp-btn sp-secondary chip'; mk.id = 'opt-marks'; mk.setAttribute('data-sound', 'pop');
  mk.onclick = () => { PICK.marks = !PICK.marks; ls.set('marks', PICK.marks ? 1 : 0); markPicks(); }; ob.appendChild(mk);
  markPicks();
}
function markPicks(){
  document.querySelectorAll('#map-list .map').forEach(b => gfPick(b, b.dataset.k === PICK.size));
  document.querySelectorAll('#level-list .lvl').forEach(b => gfPick(b, Number(b.dataset.i) === PICK.lvl));
  document.querySelectorAll('#players-box .chip').forEach(b => gfPick(b, Number(b.dataset.k) === PICK.robot));
  const mk = $('opt-marks'); if(mk) mk.textContent = '🎯 Landing marks: ' + (PICK.marks ? 'On' : 'Off');
  const L = levelFor(PICK.lvl, PICK.size), M = MODES.find(m => m.k === PICK.mode);
  $('btn-start').textContent = '▶ Start · ' + M.icon + ' ' + M.name + ' · ' + L.emoji + ' ' + L.name + ' · ' + L.cols + ' lanes';
}
function startSetup(){ if(!canPlay(PICK.lvl)){ UISound.play('error'); UI.toast('Pick a level that is open 🔓'); return; } startGame(PICK.lvl); }

/* ================= ⑤ PLAY SCREEN — the shared bar, canvas, pads, input, layout ================= */
const BAR = UI.gameBar($('gbar'), {game: GAME_ID, icon: GAME_ICON, name: GAME_NAME, levelId: 'hud-level',
  levels: () => leavePlay(), playing: () => !!(G && !G.M.over), onLeave: () => stopMood(),
  pause: {pause: () => setPaused(true, 'bar'), resume: () => setPaused(false, 'bar')}, pauseButton: true, onFit: () => layout()});
const cv = $('cv'), g = cv.getContext('2d');
const V = {w: 0, h: 0, dpr: 1, u: 40, ox: 0, oy: 0, cols: 5};   // view: px per field unit + field origin
function layout(){
  if(!G) return; const r = $('stage').getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
  V.w = Math.max(1, Math.round(r.width)); V.h = Math.max(1, Math.round(r.height)); V.dpr = dpr; cv.width = Math.round(V.w * dpr); cv.height = Math.round(V.h * dpr);
  const css = getComputedStyle(document.documentElement), px = n => parseFloat(css.getPropertyValue(n)) || 0;
  const touch = document.body.classList.contains('touchy'), upright = V.h > V.w * 1.05;
  // keep the thumbs off the field: upright = a band at the bottom, sideways = the side margins
  let band = 0, side = 12;
  if(touch){   // lay the 🌸 ring out first, then MEASURE the thumbs' real footprint (the ring is taller than one button)
    if(window.UI && UI.pad && UI.pad.arcAll) UI.pad.arcAll($('pads'));
    const pr = [...document.querySelectorAll('#pads button')].map(b => b.getBoundingClientRect()).filter(q => q.width > 0), gap = 8;
    if(pr.length){
      if(upright) band = r.bottom - Math.min(...pr.map(q => q.top)) + gap;
      else { const L = [...document.querySelectorAll('#pad-l button')].map(b => b.getBoundingClientRect()), R = [...document.querySelectorAll('#pad-r button')].map(b => b.getBoundingClientRect());
        side = Math.max(L.length ? Math.max(...L.map(q => q.right)) - r.left : 0, R.length ? r.right - Math.min(...R.map(q => q.left)) : 0) + gap; }
    } else band = upright ? Math.max(px('--pad-main'), px('--pad-arrow')) + px('--pad-edge') * 2 : 0;
  }
  const grass = Math.max(10, V.h * 0.05);   // a strip of grass under the catchers' feet
  V.cols = G.M.cols; V.u = Math.max(8, Math.min((V.w - side * 2) / V.cols, (V.h - band - grass - 8) / ENG.ROWS));
  V.ox = Math.round((V.w - V.u * V.cols) / 2); V.oy = Math.round(V.h - band - grass - V.u * ENG.ROWS);
}
const X = x => V.ox + x * V.u, Y = y => V.oy + y * V.u;
function setPaused(on, why){ if(!G) return; G.pz[why] = on; G.paused = Object.values(G.pz).some(Boolean); if(G.mood && G.mood.pause) G.mood.pause(G.paused); }
// input: keys (← → A D · Space ↑ W = jump · H = cheer), drag / tap on the field, ◀ ▶ + ⤴ 🙌 pads
const KEYS = {};
addEventListener('keydown', e => { if(!G || G.M.over) return; const k = e.code;
  if(['ArrowLeft', 'KeyA'].includes(k)){ KEYS.l = 1; e.preventDefault(); } else if(['ArrowRight', 'KeyD'].includes(k)){ KEYS.r = 1; e.preventDefault(); }
  else if(['Space', 'ArrowUp', 'KeyW'].includes(k)){ if(!e.repeat) doJump(); e.preventDefault(); } else if(k === 'KeyH' && !e.repeat) doCheer(); else return; G.keyed = true; });
addEventListener('keyup', e => { const k = e.code; if(['ArrowLeft', 'KeyA'].includes(k)) KEYS.l = 0; if(['ArrowRight', 'KeyD'].includes(k)) KEYS.r = 0; });
function holdBtn(el, key){ if(!el) return; const on = e => { e.preventDefault(); KEYS[key] = 1; el.classList.add('pz-down'); try{ el.setPointerCapture(e.pointerId); }catch(x){} if(G) G.keyed = true; },
  off = () => { KEYS[key] = 0; el.classList.remove('pz-down'); }; el.addEventListener('pointerdown', on); el.addEventListener('pointerup', off); el.addEventListener('pointercancel', off); el.addEventListener('lostpointercapture', off); }
holdBtn($('btn-left'), 'l'); holdBtn($('btn-right'), 'r');
if(UI.pad){ UI.pad.dress($('btn-jump'), '⤴', 'Jump', '#FFC845', true); UI.pad.dress($('btn-cheer'), '🙌', 'Cheer', '#9BD7FF'); UI.pad.fan($('pad-r'), $('btn-jump'), [$('btn-cheer')]); }   // M = main, petal 1 = ← (pad rule slots)
$('btn-jump').addEventListener('pointerdown', e => { e.preventDefault(); doJump(); }); $('btn-cheer').addEventListener('pointerdown', e => { e.preventDefault(); doCheer(); });
let dragId = null;
cv.addEventListener('pointerdown', e => { if(!G || G.M.over) return; dragId = e.pointerId; try{ cv.setPointerCapture(e.pointerId); }catch(x){} aimAt(e); });
cv.addEventListener('pointermove', e => { if(dragId === e.pointerId) aimAt(e); });
['pointerup', 'pointercancel'].forEach(t => cv.addEventListener(t, e => { if(dragId === e.pointerId) dragId = null; }));
function aimAt(e){ const r = cv.getBoundingClientRect(); ENG.input(G.M, 'me', {target: (e.clientX - r.left - V.ox) / V.u}); G.keyed = true; }
addEventListener('touchstart', () => { if(!document.body.classList.contains('touchy')){ document.body.classList.add('touchy'); if(G) layout(); } }, {passive: true});
if(window.matchMedia && matchMedia('(pointer: coarse)').matches) document.body.classList.add('touchy');
function doJump(){ if(G && !G.M.over && !G.paused) ENG.input(G.M, 'me', {jump: true}); }
function doCheer(){ if(!G || G.M.over || G.paused) return; scStart(G.me, 'cheer', G.M.t + 0.12); }
// 📱 the play box changed size (rotate, toolbar, first open sideways) → lay out again (ls-1 rule)
if(window.ResizeObserver) new ResizeObserver(() => { if(G) layout(); }).observe($('stage')); addEventListener('resize', () => { if(G) layout(); });

/* ================= ⑥ BEATS — every avatar ACTION = 3–5 beats on the shared timeline; the game scores on CONTACT ================= */
// catch: the next star that will reach your hands within 0.25 s while you stand under it → the reach starts EARLY (wind-up), contact = arrival;
// a catch that comes without a wind-up plays from contact; a wind-up whose star never comes lets go 0.3 s later. 🌟 leap: contact = the top.
// 🌧️ oops: at once (no wind-up for a hit). Clock = the engine's own time (stops with ⏸). Acts = AvatarActs 🎭 BLOCK `starter`.
const SCB_HAS = typeof Acting !== 'undefined' && typeof Acting.play === 'function';
const SCB_ACTS = {catch: GAME_ID + '.catch', leap: GAME_ID + '.leap', oops: GAME_ID + '.oops', cheer: GAME_ID + '.cheer'};
window.SCB_LOG = [];
function scStart(A, kind, atT, from){
  if(!SCB_HAS || !A || !Acting.act(SCB_ACTS[kind])) return false;
  const prev = A.act && A.act.run.last, t = G.M.t;
  const run = Acting.play(A.who, SCB_ACTS[kind], {t0: t, contactAt: atT, from: from || prev || undefined, speed: G.M.L.guided ? 1.1 : 1,
    onContact: r => { window.SCB_LOG.push({who: A.key, kind, t: G.M.t, at: r.contactT}); if(window.SCB_LOG.length > 300) window.SCB_LOG.shift(); }});
  A.act = {kind, run, star: null, letGo: 0}; run.at(t); return true;
}
function scNow(A, kind){   // contact NOW: re-play from the current frame so contact lands in this very tick
  const t = G.M.t, keep = A.act && A.act.kind === kind && A.act.run.last; scStart(A, kind, t, keep || undefined); if(A.act) A.act.run.at(Math.max(t, A.act.run.contactT || t) + 1e-6);
}
function scLookAhead(A, P){
  if(!P || (A.act && !A.act.run.last.done && A.act.kind !== 'catch')) return;
  if(A.act && A.act.kind === 'catch' && A.act.star){ if(G.M.t > A.act.letGo){ A.act = null; } return; }
  const it = G.M.items.find(s => s.kind === 'star' && !s.wait && Math.abs(s.x - P.x) <= ENG.REACH && s.y < ENG.HAND && (ENG.HAND - s.y) / s.v < 0.25);
  if(it && scStart(A, 'catch', G.M.t + Math.ceil((ENG.HAND - it.y) / (it.v * ENG.DT) - 1e-9) * ENG.DT)){ A.act.star = it.id; A.act.letGo = A.act.run.contactT + 0.3; }   // contact = the exact engine tick the star crosses the hands
}
function scEvent(e){
  const A = e.who === 'bot' ? G.bot : G.me; if(!A) return;
  if(e.type === 'catch' && e.kind === 'star'){   // the wind-up was for THIS star at THIS tick → fire its contact now; anything else → play from contact
    if(A.act && A.act.kind === 'catch' && A.act.star === e.id && Math.abs((A.act.run.contactT || 0) - G.M.t) < 1e-4){ A.act.star = null; A.act.run.at(Math.max(G.M.t, A.act.run.contactT) + 1e-6); }
    else scNow(A, 'catch'); if(A.act) A.act.star = null; }
  if(e.type === 'jump') scStart(A, 'leap', e.apexT);
  if(e.type === 'hit') scNow(A, 'oops');
  if(e.type === 'goal' && e.who !== 'bot') scStart(G.me, 'cheer', G.M.t + 0.12);
}
function scTick(A){ if(!A || !A.act) return; const f = A.act.run.at(G.M.t + 1e-7);   /* + a float crumb: a contact planned for this tick fires in this tick */ if(f.done && !A.act.star) A.act = null; }
function drawActor(A, P, isBot){
  const x = X(P.x), feet = Y(ENG.ROWS) - ENG.lift(P) * V.u, k = V.u * 1.5 / 105;
  g.fillStyle = 'rgba(0,0,0,.22)'; g.beginPath(); g.ellipse(x, Y(ENG.ROWS) - 2, V.u * 0.36 * (1 - ENG.lift(P) / 3), V.u * 0.09, 0, 0, 7); g.fill();
  if(P.inv > 0 && Math.floor(G.M.t * 12) % 2) g.globalAlpha = 0.45;
  const F = A.act && A.act.run.last;
  try { if(F && !F.done) Acting.draw(g, A.who, x, feet, k, F, {t: G.M.t, keep: true}); else drawAvatar(g, A.who, x, feet, k, {t: G.M.t}); }
  catch(e){ drawAvatar(g, A.who, x, feet, k, {t: G.M.t}); }
  g.globalAlpha = 1;
  if(isBot && typeof emo === 'function') emo(g, '🤖', x, feet - V.u * 1.85, Math.round(V.u * 0.34));   // emoji through AvatarKit's cached sprite (🐢 emoji lag rule)
}

/* ================= the game loop ================= */
function startGame(lvl){
  cancelAnimationFrame(rafId); hideResult(); if(Cover) Cover.hide();
  const L = levelFor(lvl, PICK.size), mode = PICK.mode;
  const M = ENG.newMatch({L, mode, robot: PICK.robot, seed: (Date.now() >>> 0) ^ 0x5eed});
  G = {lvl, M, L, mode, acc: 0, last: performance.now(), t0: performance.now(), pz: {}, paused: false, fx: [], keyed: false, ended: false,
    me: {key: 'me', who: {name: S.player, av: myAvatar()}, act: null}, bot: M.bot ? {key: 'bot', who: {name: 'Robo', av: defaultAvatar('Robo')}, act: null} : null};
  BAR.level(L.emoji + ' ' + L.name + ' · ' + L.cols + ' lanes', L.hardcore ? 'hc' : ''); BAR.score(0); hud();
  showScreen('play'); BAR.fit(); layout();
  G.mood = startMood(); calloutSetup();
  UI.banner && UI.banner(mode === 'race' ? '🤖 Catch more stars than the robot in 1 minute!' : (L.guided ? '👆 Walk under the star — it waits for you!' : 'Catch ' + L.goal + ' stars! ⭐'), {icon: GAME_ICON});
  G.last = performance.now(); rafId = requestAnimationFrame(loop);
}
function loop(now){
  if(!G) return; const dt = Math.min(0.05, (now - G.last) / 1000); G.last = now;
  if(!G.paused && !G.M.over){
    const dir = (KEYS.r ? 1 : 0) - (KEYS.l ? 1 : 0); if(dir || G.lastDir) ENG.input(G.M, 'me', {dir}); G.lastDir = dir;
    if(window.ST_AUTO) ENG.autoPlay(G.M);   // tests: the careful auto-player
    G.acc += dt; let n = 0;
    while(G.acc >= ENG.DT && n < 30 && !G.M.over){   // ONE engine tick at a time → an act's contact lands in the SAME tick as its game event
      ENG.tick(G.M, ENG.DT); G.acc -= ENG.DT; n++;
      ENG.takeEvents(G.M).forEach(onEvent); scLookAhead(G.me, G.M.p); if(G.bot) scLookAhead(G.bot, G.M.bot); scTick(G.me); if(G.bot) scTick(G.bot);
    }
    hud(); moodTick();
  }
  if(G.M.over && !G.ended){ G.ended = true; ENG.takeEvents(G.M).forEach(onEvent); setTimeout(() => finishGame(), G.M.cleared ? 1100 : 800); }
  if(G.M.over){ G.M.t += dt; scTick(G.me); if(G.bot) scTick(G.bot); }   // the cheer / oops plays on after the end (the engine is stopped)
  drawField(now / 1000); rafId = requestAnimationFrame(loop);
}
function onEvent(e){
  scEvent(e);
  if(e.type === 'catch'){ fxBurst(e.x, e.kind === 'big' ? ENG.BIG_Y : ENG.HAND, e.kind === 'big' ? '#FFD447' : '#FFF0A8', e.kind === 'big' ? 18 : 10);
    if(e.who !== 'bot'){ UISound.play(e.kind === 'big' ? 'success' : 'pop'); if(G.mood && G.mood.lift && e.kind === 'big') G.mood.lift();
      if(e.kind === 'big') say('Big star!', 'big'); else if(e.streak && e.streak % 5 === 0) say(e.streak + ' in a row!', 'good'); else if(Math.random() < 0.15) say(['Nice catch!', 'Got it!', 'Yes!'][Math.floor(Math.random() * 3)], 'small'); } }
  if(e.type === 'hit' && e.who !== 'bot'){ UISound.play('error'); say('Splash! 🌧️', 'good'); }
  if(e.type === 'miss'){ fxBurst(e.x, ENG.ROWS - 0.1, '#BFC6FF', 5); }
  if(e.type === 'goal'){ UISound.play('success'); }
}
function say(text, rank){ try{ if(UI.callout) UI.callout(text, {who: 'me', rank: rank || 'small'}); }catch(e){} }
function hud(){
  const M = G.M, P = M.p; BAR.score(P.score);
  if(G.mode === 'race'){ BAR.count('stars', '⭐', (P.caught + P.big) + ' : ' + (M.bot.caught + M.bot.big), 'You : robot'); BAR.left(Math.round(M.left * 1000), M.left < 10); }
  else { BAR.count('stars', '⭐', (P.caught + P.big) + '/' + M.L.goal, 'Stars caught'); if(!M.L.guided) BAR.time(Math.floor(M.t)); }
  if(!M.L.guided) BAR.lives(P.hearts, P.hearts <= 1);
}
function fxBurst(x, y, col, n){ for(let i = 0; i < n; i++){ const a = Math.random() * Math.PI * 2, s = 1.5 + Math.random() * 2.5; G.fx.push({x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 1, t: 0, col}); } }
// a star shape (no emoji fillText in the frame loop — the 🐢 emoji lag rule)
function starPath(x, y, r, rot){ g.beginPath(); for(let i = 0; i < 10; i++){ const a = rot - Math.PI / 2 + i * Math.PI / 5, rr = i % 2 ? r * 0.45 : r; g.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr); } g.closePath(); }
function drawField(t){
  if(!G) return; const M = G.M, u = V.u; g.setTransform(V.dpr, 0, 0, V.dpr, 0, 0);
  let gr = g.createLinearGradient(0, 0, 0, V.h); gr.addColorStop(0, '#141A4A'); gr.addColorStop(0.7, '#3A2D7A'); gr.addColorStop(1, '#6E4CA0'); g.fillStyle = gr; g.fillRect(0, 0, V.w, V.h);
  // field: lanes + grass
  g.fillStyle = 'rgba(255,255,255,.04)'; for(let c = 0; c < M.cols; c += 2) g.fillRect(X(c), Y(0), u, ENG.ROWS * u);
  g.fillStyle = '#3F8F57'; g.fillRect(0, Y(ENG.ROWS), V.w, V.h - Y(ENG.ROWS)); g.fillStyle = '#4FA867'; g.fillRect(0, Y(ENG.ROWS), V.w, Math.max(3, u * 0.08));
  // 🎯 landing marks (option; 🌱 Basic: the waiting star's spot glows strong)
  if(PICK.marks || M.L.guided) M.items.forEach(it => { if(it.kind === 'big') return; const a = it.kind === 'rain' ? 0.35 : it.wait ? 0.55 + 0.35 * Math.sin(t * 6) : 0.35;
    g.strokeStyle = it.kind === 'rain' ? 'rgba(120,190,255,' + a + ')' : 'rgba(255,230,120,' + a + ')'; g.lineWidth = Math.max(2, u * 0.06); g.beginPath(); g.ellipse(X(it.x), Y(ENG.ROWS) + u * 0.02, u * 0.34, u * 0.1, 0, 0, 7); g.stroke(); });
  // items
  M.items.forEach(it => { const x = X(it.x), y = Y(it.y);
    if(it.kind === 'rain'){ g.fillStyle = '#7CC4FF'; g.strokeStyle = '#2F6FB8'; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y - u * 0.3); g.quadraticCurveTo(x + u * 0.22, y, x, y + u * 0.18); g.quadraticCurveTo(x - u * 0.22, y, x, y - u * 0.3); g.fill(); g.stroke(); return; }
    const big = it.kind === 'big', r = u * (big ? 0.42 : 0.26), bob = big && it.hover > 0 ? Math.sin(t * 4) * u * 0.06 : 0, fade = big && it.hover > ENG.HOVER - 0.8 ? (ENG.HOVER - it.hover) / 0.8 : 1;
    g.globalAlpha = Math.max(0, fade);
    if(big){ const rg = g.createRadialGradient(x, y + bob, 0, x, y + bob, r * 2.2); rg.addColorStop(0, 'rgba(255,220,90,.5)'); rg.addColorStop(1, 'rgba(255,220,90,0)'); g.fillStyle = rg; g.beginPath(); g.arc(x, y + bob, r * 2.2, 0, 7); g.fill(); }
    g.fillStyle = big ? '#FFD447' : '#FFF0A8'; g.strokeStyle = 'rgba(140,90,0,.6)'; g.lineWidth = Math.max(1, r * 0.1); starPath(x, y + bob, r, t * (big ? 1.5 : 2.5) + it.id); g.fill(); g.stroke(); g.globalAlpha = 1; });
  // catchers
  if(G.bot) drawActor(G.bot, M.bot, true);
  drawActor(G.me, M.p, false);
  // sparkles
  G.fx = G.fx.filter(p => (p.t += 1 / 60) < 0.7); G.fx.forEach(p => { p.x += p.vx / 60; p.y += p.vy / 60; p.vy += 4 / 60; g.globalAlpha = 1 - p.t / 0.7; g.fillStyle = p.col; g.beginPath(); g.arc(X(p.x), Y(p.y), Math.max(1.5, u * 0.05), 0, 7); g.fill(); }); g.globalAlpha = 1;
  // 👆 🌱 Basic guide: before the first catch, a hand points at the waiting star's landing spot
  if(M.L.guided && M.p.caught === 0){ const w = M.items.find(it => it.wait); if(w){ const hx = X(w.x), hy = Y(ENG.ROWS) - u * 0.2 - Math.abs(Math.sin(t * 4)) * u * 0.25;
    if(typeof emo === 'function') emo(g, '👆', hx, hy + u * 0.6, Math.round(u * 0.6)); } }
}
// 🎵 mood: tension = how close the goal (or the clock); lift on a big star; stop on the result card / leaving (24u rules)
function startMood(){ try{ if(!(window.UISound && UISound.mood)) return null; const known = UISound.MOODS && Object.prototype.hasOwnProperty.call(UISound.MOODS, GAME_ID);
  return UISound.mood(known ? GAME_ID : {fam: MOOD_FAMILY, id: GAME_ID}); }catch(e){ return null; } }
function moodTick(){ const M = G.M; if(!G.mood || !G.mood.tension) return; G.mood.tension(M.mode === 'race' ? 1 - M.left / 60 : (M.p.caught + M.p.big) / M.L.goal); }
function stopMood(){ if(G && G.mood && G.mood.stop){ try{ G.mood.stop(); }catch(e){} G.mood = null; } }
// 💬 words during play go through UI.callout (never your own centre word): keep people clear, words beside the field
function calloutSetup(){ try{ if(!(UI.callout && UI.callout.setup)) return; const box = () => cv.getBoundingClientRect();
  UI.callout.setup({keep: () => { const r = box(), P = G.M.p, x = r.left + X(P.x), y = r.top + Y(ENG.ROWS); return [{l: x - V.u * 0.6, t: y - V.u * 1.9, r: x + V.u * 0.6, b: y}]; },
    inside: (x, y) => { const r = box(); return x > r.left + V.ox && x < r.left + V.ox + V.u * V.cols && y > r.top + V.oy && y < r.top + Y(ENG.ROWS); },
    at: () => { const r = box(), P = G.M.p; return {x: r.left + X(P.x), y: r.top + Y(ENG.ROWS) - V.u * 1.9}; }, side: () => 0, crowd: () => null, me: S.player}); }catch(e){} }

/* ================= ⑦ END + SAVE — the shared 🏁 card, saveLevelResult (+ pending queue) ================= */
function leavePlay(){
  if(!G || G.M.over){ backToMenu(); return; }
  setPaused(true, 'leave');
  UI.confirm({icon: '◀', title: 'Leave this game?', body: 'Your stars so far will be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(!G) return; setPaused(false, 'leave'); if(ok){ finishGame(true); backToMenu(); } });
}
function backToMenu(){ stopMood(); try{ UI.callout && UI.callout.setup && UI.callout.setup(null); }catch(e){} cancelAnimationFrame(rafId); G = null; hideResult(); renderSetup(); showScreen('menu'); }
function pauseGame(){ setPaused(true, 'lock'); }
function finishGame(quiet){
  if(!G || G.done) return; G.done = true; const thisGame = G, M = G.M, L = G.L, P = M.p, secs = Math.max(1, Math.round(M.t)), cleared = M.cleared;
  const stars = !cleared ? 0 : P.hearts >= L.hearts ? 3 : P.hearts >= Math.ceil(L.hearts / 2) ? 2 : 1;
  stopMood(); try{ UI.callout && UI.callout.setup && UI.callout.setup(null); }catch(e){}
  if(P.caught + P.big > 0) saveWin(G.lvl, {timeSec: secs, stars, score: P.score, theme: L.theme, cleared, stats: {caught: P.caught, big: P.big, bestStreak: P.best, hits: P.hit, games: 1}});
  if(quiet) return;
  const race = G.mode === 'race', mine = P.caught + P.big, theirs = race ? M.bot.caught + M.bot.big : 0, hasNext = cleared && G.lvl < LEVELS.length - 1;
  setTimeout(() => {
    if(G !== thisGame) return;
    GF.result({wrap: $('result'), card: $('result-card'), win: cleared, icon: cleared ? '🏆' : GAME_ICON,
      title: race ? (cleared ? 'You beat the robot!' : 'The robot wins this time') : (cleared ? 'All stars caught!' : 'Out of hearts!'),
      sub: race ? 'You ' + mine + ' · robot ' + theirs : (cleared ? 'You caught ' + mine + ' stars!' : 'You caught ' + mine + ' of ' + L.goal + ' — try again!'), stars: cleared ? stars : null,
      score: P.score, stats: [['⭐', P.caught + ' stars'], ['🌟', P.big + ' big'], ['🔥', 'best streak ' + P.best], ['⏱', secs + ' s']],
      save: DEMO ? '🧪 Starter demo — scores are not saved' : 'Saving your score…', buddy: {name: S.player, av: myAvatar()},
      levels: () => backToMenu(), again: () => startGame(G.lvl),
      next: hasNext ? () => { hideResult(); if(canPlay(G.lvl + 1)){ PICK.lvl = G.lvl + 1; ls.set('lvl', PICK.lvl); startGame(PICK.lvl); } else backToMenu(); } : null,
      nextText: G.lvl === 4 ? '💀 Try Hardcore ▶' : 'Next level ▶'});
  }, 200);
}
const PENDING_KEY = 'sp_' + GAME_ID + '_pending';
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ if(DEMO) return; const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))).saveLevelResult(GAME_ID, w.name, w.lvl, w.extra)); }
function saveWin(lvlIdx, extra, tries){
  tries = tries || 0; const name = S.player;
  if(DEMO){ const p = progressOf(name); if(extra.cleared) p.unlocked = Math.max(p.unlocked || 0, lvlIdx + 1); try{ localStorage.setItem('sp_starter_prog:' + name, JSON.stringify(p)); }catch(e){} return; }
  const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []}); if(extra.cleared) p.unlocked = Math.max(p.unlocked, lvlIdx + 1);
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best; S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending();
      const put = () => { const n2 = $('save-note'); if(n2) n2.innerHTML = saveText(res); }; if(!$('save-note')) setTimeout(put, 1500); else put();
    }).withFailureHandler(err => {
      if(tries < 1){ setTimeout(() => saveWin(lvlIdx, extra, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}]));
      const put = () => { const n2 = $('save-note'); if(n2) n2.innerHTML = '⚠️ Could not save yet — it will be sent again next time.'; }; if(!$('save-note')) setTimeout(put, 1500); else put();
    }).saveLevelResult(GAME_ID, name, lvlIdx, extra);
}
function saveText(res){
  let h = res.newBadge ? '🏅 New badge: ' + UI.esc(res.newBadge) : res.newHighScore && !res.firstTime ? '🎉 New high score!' : res.best && res.best.score ? 'Your best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Score saved';
  const fe = res.feats; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br>🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name); }); (fe.newBadges || []).forEach(b => { h += '<br>' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName; }); }
  return h;
}
function hideResult(){ $('result').classList.add('hidden'); }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }

/* ================= ⑧ BOOT — one server call, then the cover ================= */
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
    .getLevelGameData(DEMO ? 'hopper' : GAME_ID, CURRENT_PLAYER);   // the demo borrows Hopper's boot call (players + avatars); a real game asks for its own
}
boot();
