
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];
const MODE_LINK = SP_TV[3];   // ✨ ?mode=fours | sevens (Code.gs MODES_) — opened once, after the player pick
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
const SESSION_START = Number(SP_TV[4]) || null;
const DURATION_MIN = Number(SP_TV[5]) || null;
const GAME_ID = 'blasoff';
/* bo-1: the UiKit lane belongs to ✨ p6 — this game registers its own loader kind + ❓ help card at runtime (a 2-line UiKit anchor is asked for under Open questions) */
if(UI.KINDS && !UI.KINDS.blasoff) UI.KINDS.blasoff = ['⚽', 'Blasting onto the pitch', 'launch'];
if(UI.GAME_HELP && !UI.GAME_HELP.blasoff) UI.GAME_HELP.blasoff = ['Soccer with your avatar — score more goals than the other team!', 'Run with W A S D or the 🕹️ stick. J pass · K shoot · L trick · Space jump (twice = flick it up, then K = volley!).', 'When they shoot at your goal, shout Q or E — your robot keeper dives that way.'];
const BAR = UI.gameBar(document.getElementById('gbar'), {game: GAME_ID, icon: '⚽', name: 'BlasOff', levelId: 'hud-level', scoreMin: '4ch',
  levels: () => leavePlay(), playing: () => !!(G && !G.over), onLeave: () => { try{ speechSynthesis.cancel(); }catch(e){} },
  pause: {pause: () => pauseGame(), resume: () => { if(G && G.paused && !G.over) togglePause(); }},
  onFit: () => { if(G){ resize(); buildPads(); } },
  extras: [{id: 'view-btn', icon: '📷', label: 'Camera: behind · side · above (V)', onClick: () => cycleView(), keep: true}, {id: 'zoom-btn', icon: '🔍', label: 'Zoom in / out (Z)', onClick: () => toggleZoom(), keep: true}, {id: 'pause-btn', html: '<span class="gb-pzi" aria-hidden="true"><i></i><i></i></span>', label: 'Pause (P)', onClick: () => togglePause(), keep: true}]});
var NAV_INNER = {setup: ['◀ BlasOff', () => showScreen('menu')], cup: ['◀ BlasOff', () => backToMenu()]};   // 🏆 R4a: the cup screen goes back to the start page too   // 🧭 the setup screen's top button goes back to the BlasOff start page
UI.navBar(document.getElementById('back-btn'), {onclick: false});
const $ = id => document.getElementById(id);
let FX = 1;   // harness sets 0 (no big words / confetti / voice)
function fmt(s){ s = Math.max(0, Math.ceil(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function say(text){ try{ if(!FX || !UISound.get().enabled || !window.speechSynthesis) return; speechSynthesis.cancel(); const u = new SpeechSynthesisUtterance(text); u.rate = 1.05; u.pitch = 1.1; speechSynthesis.speak(u); }catch(e){} }
function pickOne(a){ return a[Math.floor(Math.random() * a.length)]; }
function lim(v, a, b){ return v < a ? a : v > b ? b : v; }

/* ================= DATA ================= */
const LEVEL_UI = [
  {emoji: '🌱', blurb: 'Slow robots + big aim help. The next pass glows, an arrow shows the goal.'},
  {emoji: '🐣', blurb: 'Robots pass and run. Try a trick with L!'},
  {emoji: '🔥', blurb: 'Robots mark + tackle. Slide tackles and fouls are on.'},
  {emoji: '⚡', blurb: 'Offside, stamina, a penalty shootout if it ends level.'},
  {emoji: '🌋', blurb: 'Smart robots, yellow cards — and no aim help.'},
  {emoji: '💀', blurb: 'The strongest robots. 3 goals behind = game over · ×3 points.', hardcore: true}
];
const AGE_START = {'4-5': 0, '6-7': 0, '8-9': 1, '10+': 2};
const TEAM_COL = ['#2F80ED', '#E5484D'], TEAM_KIT = [5, 0], KEEPER_KIT = [2, 3], SEAT_COL = ['#FFD23F', '#FF6FD8'];
const ROBO_TEAMS = ['Robo Rookies', 'Robo Runners', 'Robo Rovers', 'Robo Rockets', 'Robo Titans', 'Robo Legends'];
const ROBO_NAMES = ['Bolt', 'Gizmo', 'Sprocket', 'Beep', 'Widget', 'Rusty', 'Nova', 'Chip', 'Pixel', 'Zap', 'Cog', 'Dot', 'Echo', 'Flux'];
// 🏟️ Classic first, then the 6 house looks (look only in R1 — the pitch twists come in R3)
const LOOKS = {
  classic: {name: 'Classic stadium', icon: '🏟️', court: ['#2F6FD6', '#2A64C2'], courtOut: '#E8813A', cage: ['#4A4F5C', '#444955'], fence: '#B9C2D0', sky: ['#5AA9FF', '#CFE8FF'], skyN: ['#050B24', '#1A2E66'], grass: ['#36B05A', '#2E9E50'], out: '#2B8A47', line: '#FFFFFF', stand: '#2B3A67', crowd: ['#FF5A1F', '#FFD23F', '#FFFFFF', '#3D7BFF', '#E5484D', '#2DBE6C'], boards: ['#FF5A1F', '#3D7BFF', '#13254A'], lamps: true, deco: []},
  jungle: {name: 'Jungle', icon: '🦖', court: ['#B07A45', '#A36F3D'], courtOut: '#6B4E2E', cage: ['#6B8E3A', '#628534'], fence: '#8D6E63', sky: ['#7BD389', '#E7F7C9'], grass: ['#5BAA3A', '#4E9A31'], out: '#6B4E2E', line: '#FFF8D6', stand: '#5C3D1E', crowd: ['#8BC34A', '#FFB300', '#6D4C41'], boards: ['#2E7D32', '#8D6E63', '#33691E'], deco: [['🌋', 0, 70, 18, 22], ['🌴', -40, 30, 4, 10], ['🌴', 45, 30, 4, 10], ['🦕', 18, 40, 3, 6]], crowdEmo: ['🦖', '🦕']},
  underwater: {name: 'Underwater', icon: '🐙', court: ['#1C8FB0', '#1882A0'], courtOut: '#0E6E8C', cage: ['#D9C089', '#CEB57E'], fence: '#7CF7FF', sky: ['#0A4C8C', '#3FA9D9'], grass: ['#1FA79A', '#178F84'], out: '#E6C98F', line: '#E9FFFB', stand: '#0E6E8C', crowd: ['#FF7EB6', '#FFD23F', '#7CF7FF'], boards: ['#FF6B6B', '#1FA79A', '#0E4C7A'], deco: [['🪸', -30, 34, 1, 5], ['🪸', 30, 34, 1, 5], ['🐠', 0, 60, 10, 5], ['🐙', -16, 55, 6, 7]], tint: 'rgba(30,120,200,0.10)', bubbles: true},
  neon: {name: 'Neon arena', icon: '🪩', court: ['#1A0B33', '#220E42'], courtOut: '#0A0418', cage: ['#0E0820', '#150B2E'], fence: '#FF2EC4', sky: ['#120326', '#3A0B5C'], grass: ['#160B2E', '#1F1040'], out: '#0A0418', line: '#3DF2FF', stand: '#24104A', crowd: ['#FF2EC4', '#3DF2FF', '#FFE83D', '#8CFF3D'], boards: ['#FF2EC4', '#3DF2FF', '#7A2EFF'], deco: [['🪩', 0, 40, 16, 7]], glow: true},
  robot: {name: 'Robot stadium', icon: '🤖', court: ['#5E6B7E', '#566275'], courtOut: '#3A4458', cage: ['#3A4252', '#343B4A'], fence: '#5CC8FF', sky: ['#7D8BA1', '#D7DEE8'], grass: ['#8996A8', '#7A879A'], out: '#4B5568', line: '#FFE45C', stand: '#3A4458', crowd: ['#BFC8D6', '#5CC8FF', '#FFE45C'], boards: ['#5CC8FF', '#FFE45C', '#3A4458'], deco: [['🛸', -20, 30, 12, 5], ['🛸', 25, 36, 14, 5]], drones: true},
  moon: {name: 'Moon crater', icon: '🪐', court: ['#8C8DA0', '#838497'], courtOut: '#4A4B57', cage: ['#6E6F7C', '#666774'], fence: '#D7D9E6', sky: ['#020412', '#1B1F3A'], grass: ['#A9AAB5', '#9B9CA8'], out: '#6E6F7C', line: '#FFFFFF', stand: '#4A4B57', crowd: ['#D7D9E6', '#8E93B8', '#FFFFFF'], boards: ['#3D7BFF', '#9B9CA8', '#1B1F3A'], deco: [['🌍', 30, 90, 30, 14], ['🚀', -40, 60, 18, 6]], stars: true, craters: true},
  olympus: {name: 'Olympus clouds', icon: '☁️', court: ['#F1E6C8', '#E8DCBB'], courtOut: '#C9A227', cage: ['#DCD3BE', '#D2C8B2'], fence: '#FFD23F', sky: ['#8EC9FF', '#FFF6DE'], grass: ['#7FD08A', '#6FC27B'], out: '#FFFFFF', line: '#FFD23F', stand: '#F2EEE3', crowd: ['#FFD23F', '#FFFFFF', '#9FD3FF'], boards: ['#FFD23F', '#FFFFFF', '#C9A227'], deco: [['🏛️', 0, 52, 2, 9], ['☁️', -30, 45, 14, 9], ['☁️', 34, 50, 18, 9], ['⚡', 12, 70, 22, 5]], clouds: true}
};
const LOOK_KEYS = Object.keys(LOOKS);
const ADS = ['SlaBrall', 'Turbo Trail', 'Snakize', 'Pinball', 'BeatCorner', 'WisDeck', 'Soul Bopper', 'GeoScout', 'Brawl Buddies', 'Artifactory'];
const ACTIONS = [['up', '⬆️ Up'], ['down', '⬇️ Down'], ['left', '⬅️ Left'], ['right', '➡️ Right'], ['pass', '⚽ Pass / tackle'], ['shoot', '💥 Shoot / slide'], ['trick', '🌀 Trick / call'], ['jump', '🦘 Jump (2× = flick up)'], ['sprint', '💨 Sprint'], ['sw', '🔄 Switch player'], ['shoutL', '📣 Shout ⬅️'], ['shoutR', '📣 Shout ➡️']];
const DEFAULT_KEYS = [
  {up: 'KeyW', down: 'KeyS', left: 'KeyA', right: 'KeyD', pass: 'KeyJ', shoot: 'KeyK', trick: 'KeyL', jump: 'Space', sprint: 'ShiftLeft', sw: 'KeyC', shoutL: 'KeyQ', shoutR: 'KeyE'},
  {up: 'ArrowUp', down: 'ArrowDown', left: 'ArrowLeft', right: 'ArrowRight', pass: 'Numpad1', shoot: 'Numpad2', trick: 'Numpad3', jump: 'Numpad0', sprint: 'ShiftRight', sw: 'NumpadEnter', shoutL: 'Numpad4', shoutR: 'Numpad6'}
];
const LOGIC = {pass: 'J', shoot: 'K', trick: 'L', jump: 'SP'};

/* 🗂️ MODE GROUPS (mg-1) + 🃏 mode cards (R1 = ⚽ Soccer 4v4 + 7v7; the 🔜 box shows what the next rounds add) */
const MODE_GROUPS = [
  {k: 'match', icon: '⚽', en: 'Matches', th: 'แข่งฟุตบอล', c: '#2DBE6C'},
  {k: 'small', icon: '🏙️', en: 'Futsal + Street', th: 'ฟุตซอล · สตรีท', c: '#FF8A1F'},
  {k: 'skill', icon: '🕺', en: 'Tricks + skills', th: 'ลีลา · ทักษะ', c: '#1FA9D6'},
  {k: 'cup', icon: '🏆', en: 'Cups + story', th: 'ถ้วย · เนื้อเรื่อง', c: '#7A5CFA'}
];
const MODES = [
  {k: 'fours', g: 'match', icon: '⚽', name: 'Soccer 4v4', type: 'A small-pitch soccer game', sub: '4 + a robot keeper a side · close camera', next: '👇 then pick a level'},
  {k: 'sevens', g: 'match', icon: '🏟️', name: 'Soccer 7v7', type: 'A bigger soccer match', sub: '7 a side · bigger pitch, more passing', next: '👇 then pick a level'},
  {k: 'elevens', g: 'match', icon: '🌍', name: 'Soccer 11v11', type: 'A full-size soccer match', sub: '11 a side · wide camera, 🔍 zoom, radar', next: '👇 then pick a level'},
  {k: 'party', g: 'match', icon: '🎉', name: 'Party ball', type: 'A match with a wild ball', sub: 'Crazy-bouncy bomb ball · goals pop into confetti', next: '👇 then pick a level'},
  {k: 'futsal', g: 'small', icon: '🥅', name: 'Futsal 5v5', type: 'Fast soccer on a court', sub: '5 a side · heavy ball, kick-ins, no offside', next: '👇 then pick a level'},
  {k: 'street', g: 'small', icon: '🏙️', name: 'Street 1v1', type: 'You vs one in a cage', sub: '🥜 nutmeg = a point · first to 5', next: '👇 then pick a level'},
  {k: 'battle', g: 'skill', icon: '🎤', name: 'Tricks Battle', type: 'Best of 3 · on the beat', sub: 'Tricks on the beat · 3 judges hold up cards', next: '👇 then pick a level'},
  {k: 'skills', g: 'skill', icon: '🎯', name: 'Skill challenges', type: '7 drills · ⭐⭐⭐ each', sub: 'Targets, crossbar, cones, keepy-ups, free kicks…', next: '👇 then pick a level'},
  {k: 'shootout', g: 'skill', icon: '🥅', name: 'Penalty shootout', type: '5 kicks each', sub: 'Kick on the 🎯 · dive in goal on theirs', next: '👇 then pick a level'},
  {k: 'cup', g: 'cup', icon: '🏆', name: 'Knockout Cup', type: '8 teams · win or go home', sub: 'Quarter-final → semi → final · draws go to 🥅 pens', next: '👇 then pick a level'},
  {k: 'league', g: 'cup', icon: '📊', name: 'League', type: '4 teams · a table', sub: 'Play everyone once · win 3 pts, draw 1 · top wins', next: '👇 then pick a level'},
  {k: 'family', g: 'cup', icon: '👑', name: 'Family cup', type: 'Family captains', sub: 'Each family member captains a team · you play yours', next: '👇 then pick a level'}   // 📜 Kick Tale joins this box in R4b
];
window.MODE_TYPE = {cup: '8 teams · win or go home', league: '4 teams · a table', family: 'Family captains', party: 'A match with a wild ball', battle: 'Best of 3 · on the beat', skills: '7 drills · ⭐⭐⭐ each', shootout: '5 kicks each', fours: 'A small-pitch soccer game', sevens: 'A bigger soccer match', elevens: 'A full-size soccer match', futsal: 'Fast soccer on a court', street: 'You vs one in a cage'};
const SZ_ID = {4: 'fours', 7: 'sevens', 11: 'elevens', 5: 'futsal', 1: 'street'}, ID_SZ = {fours: 4, sevens: 7, elevens: 11, futsal: 5, street: 1};
const SZ_NAME = {4: '4v4', 7: '7v7', 11: '11v11', 5: 'Futsal 5v5', 1: 'Street 1v1'}, SZ_LOGO = {4: '⚽', 7: '🏟️', 11: '🌍', 5: '🥅', 1: '🏙️'};

/* ================= STATE ================= */
let S = {players: [], progress: {}, settings: {}, avatars: {}, ballSkins: {}, player: '', age: ''};
let SET = {twist: true, kind: 'match', drill: 'target', size: 4, level: 0, who: 'robot', opp: '', mate: '', theme: 'classic', night: false, view: 'auto', form: '121', ball: -1};
let G = null, lockHandle = null, KEYS = null, V = null;
function ls(k, v){ try{ if(v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); }catch(e){ return null; } }
function store(k){ return 'sp_blasoff_' + k + ':' + (S.player || ''); }
function loadPrefs(){ try{ const p = JSON.parse(ls(store('prefs')) || 'null'); if(p) Object.assign(SET, {kind: ['match', 'skills', 'shootout', 'battle', 'party'].includes(p.kind) ? p.kind : 'match', twist: p.twist !== false, drill: BO.DRILLS[p.drill] ? p.drill : 'target', size: BO.SIZES[p.size] ? +p.size : 4, theme: LOOKS[p.theme] ? p.theme : 'classic', night: !!p.night, view: p.view || 'auto', form: p.form || '121', who: p.who || 'robot'}); }catch(e){} SET.ball = sharedBall(); fixForm(); }
function savePrefs(){ ls(store('prefs'), JSON.stringify({twist: SET.twist, kind: SET.kind, drill: SET.drill, size: SET.size, theme: SET.theme, night: SET.night, view: SET.view, form: SET.form, who: SET.who})); }
function fixForm(){ const Sz = BO.SIZES[SET.size]; if(!Sz.forms[SET.form]) SET.form = Sz.formOrder[0]; }
function ownedBalls(name){ return Math.min(BallSkins.count, Number((S.ballSkins || {})[name || S.player]) || 0); }
function sharedBall(){ const raw = ls('sp_ball:' + S.player); if(raw == null || raw === '') return -1; const v = Number(raw); return Number.isFinite(v) && v >= 0 && v < ownedBalls() ? v : -1; }
function myAvatar(name){ const a = S.avatars[name]; return a ? fixAv(a) : defaultAvatar(name || 'player'); }
function showScreen(name){
  ['player', 'menu', 'setup', 'play', 'cup'].forEach(s => $('scr-' + s).classList.toggle('hidden', s !== name));
  $('back-btn').classList.toggle('hidden', name === 'play'); UI.navScreen($('back-btn'), name, NAV_INNER); window.scrollTo(0, 0);
  if(name !== 'play') try{ paintLogos(); }catch(e){}   // 🏷️ bo-6
}
function progressOf(name){ return S.progress[name] || {unlocked: 0, tokens: [], best: []}; }
function canPlay(i){ const p = progressOf(S.player); if(i === 5) return p.unlocked >= 5; if(i === 4) return p.unlocked >= 4; return i <= Math.max(p.unlocked, AGE_START[S.age] || 0); }

/* ================= PLAYER PICK + START PAGE ================= */
function renderPlayers(){
  const box = $('player-list'); box.innerHTML = '';
  if(!S.players.length){ box.innerHTML = '<div class="empty">No players yet — add one on the Dashboard first.</div>'; return; }
  S.players.forEach(p => { const b = document.createElement('button'); b.className = 'pick'; b.setAttribute('data-sound', 'pop');
    const c = document.createElement('canvas'); c.width = 144; c.height = 168; b.appendChild(c);
    b.insertAdjacentHTML('beforeend', '<div class="nm">' + UI.esc(p.Name) + '</div><div class="sub">' + UI.esc(p.Age ? p.Age + ' yrs' : '') + '</div>');
    drawPreviewCanvas(c, myAvatar(p.Name), {name: p.Name, t: 1});
    b.onclick = () => choosePlayer(p.Name); box.appendChild(b); });
}
function choosePlayer(name){
  UI.rememberTheme(name, UI.applyTheme(UI.themeFor(S.settings, name), {kitOnly: true}));
  const p = S.players.find(x => x.Name === name); S.player = name; S.age = p ? p.Age : '';
  loadPrefs(); KEYS = loadKeys(); $('who-name').textContent = name; renderMenu(); showScreen('menu');
}
function changePlayer(){ renderPlayers(); showScreen('player'); }
function bestHtml(p, i){ const b = (p.best || [])[i]; if(!b || !b.score) return '<div class="best none">No win yet</div>'; return '<div class="best"><span>🏆 ' + Number(b.score).toLocaleString() + '</span><span>' + '⭐'.repeat(b.stars || 0) + '</span></div>'; }
/* 🏷️ bo-6: logos + badges drawn by BlasLogo in the picked pitch look (emoji stay if a canvas fails) */
const LOGO_URL = {}, BADGE_OF = {fours: 'match', sevens: 'match', elevens: 'match', party: 'match', futsal: 'futsal', street: 'street', battle: 'trick', skills: 'trick', shootout: 'trick', cup: 'cup', league: 'cup', family: 'cup', tale: 'cup'}, GROUP_BADGE = {match: 'match', small: 'futsal', skill: 'trick', cup: 'cup'};
function logoUrl(kind, px){ const dpr = Math.min(2, window.devicePixelRatio || 1), w = Math.round(px * dpr), k = kind + ':' + SET.theme + ':' + w; if(LOGO_URL[k]) return LOGO_URL[k]; try{ return (LOGO_URL[k] = BlasLogo.url(kind, SET.theme, w, px)); }catch(e){ return ''; } }
function logoImg(kind, px, cls, alt){ const u = logoUrl(kind, px); return u ? '<img class="' + cls + '" src="' + u + '" width="' + px + '" alt="' + alt + '" draggable="false">' : ''; }
function paintLogos(){
  const big = phoneLand() ? 170 : innerWidth < 640 ? 150 : 300;   // phones held upright: small logo so every mode box stays on the first screen
  document.querySelectorAll('#scr-player .title, #scr-menu .title').forEach(t => { const lg = t.querySelector('.logo'), h = logoImg('main', big, 'bo-mainlogo', 'BlasOff'); if(!lg || !h) return; lg.innerHTML = h; t.classList.add('has-logo'); });
  document.querySelectorAll('#mode-list .ui-mgroup').forEach(gr => { const hd = gr.querySelector('.ui-mg-h'), G = MODE_GROUPS.find(x => x.k === gr.dataset.g), bk = G && GROUP_BADGE[G.k]; if(!hd || !bk) return;
    const h = logoImg(bk, phoneLand() || innerWidth < 640 ? 24 : 28, 'bo-gbadge', ''); if(!h) return; const old = hd.querySelector('.bo-gbadge'); if(old) old.remove(); else if(hd.firstChild && hd.firstChild.nodeType === 3) hd.firstChild.textContent = hd.firstChild.textContent.replace(G.icon + ' ', ''); hd.insertAdjacentHTML('afterbegin', h); });
  document.querySelectorAll('#mode-list .ui-mbtn[data-k="futsal"] .mi, #mode-list .ui-mbtn[data-k="street"] .mi').forEach(mi => { const h = logoImg(mi.closest('.ui-mbtn').dataset.k, phoneLand() || innerWidth < 640 ? 30 : 34, 'bo-mbadge', ''); if(h) mi.innerHTML = h; });
  const sl = $('setup-logo'), bk = BADGE_OF[modeId()]; if(sl && bk && !$('scr-setup').classList.contains('hidden')){ const h = logoImg(bk, phoneLand() ? 52 : 74, 'bo-sbadge', ''); if(h) sl.innerHTML = h; }
}
function renderMenu(){
  const box = $('mode-list');
  if(!box.children.length){
    UI.modeGroups(box, MODE_GROUPS, MODES.map(m => Object.assign({}, m)), {next: () => $('lvl-head'), moreText: '👇 Pick a level below',
      onPick: k => { const m = MODES.find(x => x.k === k); if(m && m.soon){ UISound.play('error'); UI.toast('🔜 ' + m.name + ' comes in BlasOff ' + m.type.toLowerCase() + '!'); return 'stop'; }
        setKind(k); savePrefs(); markModes(); renderLevels(); return false; }});
    box.querySelectorAll('.ui-mbtn').forEach(b => { if(MODES.find(m => m.k === b.dataset.k && m.soon)) b.classList.add('soon'); });
  }
  markModes(); renderLevels(); renderRulesTable(); paintLogos();
  if(UI.leaders) UI.leaders($('leaders'), GAME_ID, S.player);
}
const KINDS = ['skills', 'shootout', 'battle', 'party', 'cup', 'league', 'family'], CUP_KINDS = ['cup', 'league', 'family'], CUP_SIZES = [4, 7, 5];
const PARTY_SIZES = [4, 7, 11, 5], THEME_WORLD = {classic: '', jungle: 'dino', underwater: 'sea', neon: 'dance', robot: 'robot', moon: 'space', olympus: 'sky'};
function partySkin(M){   // 🎉 the pitch's own bomb (Classic = a surprise world); the 🥚 egg pitch gets another so the ball never looks like the rolling egg
  let w = THEME_WORLD[M.theme]; if(!w || (M.twist === 'jungle' && w === 'dino')) w = pickOne(BombSkins.WORLD_KEYS.filter(k => k !== 'dino')); return w + ':0'; }
function modeId(){ return KINDS.includes(SET.kind) ? SET.kind : SZ_ID[SET.size]; }
function markModes(){ $('mode-list').querySelectorAll('.ui-mbtn').forEach(b => b.classList.toggle('on', b.dataset.k === modeId())); $('lvl-head').textContent = 'Pick a level · ' + (SET.kind === 'skills' ? '🎯 Skill challenges' : SET.kind === 'shootout' ? '🥅 Penalty shootout' : SET.kind === 'battle' ? '🎤 Tricks Battle' : SET.kind === 'party' ? '🎉 Party ball · ' + SZ_NAME[SET.size] : SZ_NAME[SET.size]); }
function setKind(k){ if(KINDS.includes(k)){ SET.kind = k; const ok = k === 'party' ? PARTY_SIZES : CUP_KINDS.includes(k) ? CUP_SIZES : [4, 7, 11]; if(!ok.includes(SET.size)) SET.size = k === 'party' || CUP_KINDS.includes(k) ? 4 : 7; } else { SET.kind = 'match'; SET.size = ID_SZ[k] || 4; } fixForm(); }
function halfTxt(h){ return h % 60 ? Math.floor(h / 60) + ':' + String(h % 60).padStart(2, '0') : (h / 60) + ' min'; }   // 90 → '1:30' · 120 → '2 min'
function rulesOf(i){ const L = BO.LEVELS[i], r = [], Sz = BO.SIZES[SET.size] || BO.SIZES[4]; if(Sz.firstTo) r.push('🥇 first to ' + Sz.firstTo); if(L.offside && !Sz.noOffside) r.push('🚩 offside'); if(L.fouls) r.push('🟢 fouls'); if(L.cards) r.push('🟨 cards'); if(L.stamina) r.push('💨 stamina'); r.push(['🎯 no aim help', '🎯 light aim', '🎯 medium aim', '🎯 big aim help'][L.aim]); r.push(Sz.oneHalf ? '⏱ ' + halfTxt(L.half) + '' : '⏱ 2 × ' + halfTxt(L.half) + ''); return r.join(' · '); }
function renderLevels(){
  const box = $('level-list'); box.innerHTML = ''; const p = progressOf(S.player), rec = AGE_START[S.age];
  BO.LEVELS.forEach((L, i) => {
    const U = LEVEL_UI[i], open = canPlay(i), done = p.unlocked > i, b = document.createElement('button');
    b.className = 'pick lvl' + (open ? '' : ' locked') + (i === rec && open ? ' recommended' : '') + (U.hardcore ? ' hardcore' : ''); b.setAttribute('data-sound', open ? 'pop' : 'none'); b.dataset.lv = i;
    b.innerHTML = '<span class="num">' + (i + 1) + '</span>' + (done ? '<span class="badge">🏅</span>' : open ? '' : '<span class="badge">🔒</span>') +
      '<div class="big">' + U.emoji + '</div><div class="nm">' + L.name + '</div><div class="sub">' + (U.hardcore && !open ? '🔒 Win on Extreme to open 💀 Hardcore' : U.blurb) + '</div><div class="rules-l">' + rulesOf(i) + '</div>' + bestHtml(p, i);
    b.onclick = () => { if(!open){ UISound.play('error'); UI.toast(i === 5 ? 'Win on Extreme to open 💀 Hardcore' : i === 4 ? 'Win on Hard to unlock Extreme!' : 'Win the level before to unlock it'); return; } openSetup(i); };
    box.appendChild(b);
  });
}
function renderRulesTable(){
  const t = $('rules-table'), row = (h, f) => '<tr><td>' + h + '</td>' + BO.LEVELS.map((L, i) => '<td>' + f(L, i) + '</td>').join('') + '</tr>';
  t.innerHTML = '<tr><th>👮 Rules</th>' + BO.LEVELS.map((L, i) => '<th>' + LEVEL_UI[i].emoji + '</th>').join('') + '</tr>' +
    row('Offside', L => ['❌', 'simple', '✅'][L.offside]) + row('Fouls', L => L.fouls ? '✅' : '❌') + row('🟨 Cards', L => L.cards ? '✅' : '❌') + row('Stamina', L => L.stamina ? '✅' : '❌') +
    row('Aim help', L => ['❌', 'light', 'medium', 'strong'][L.aim]) + row('Draw', L => L.draw === 'pens' ? '🥅 pens' : '⚡ golden goal');
}

/* ================= 🏆 CUPS (R4a: Knockout Cup · League · 👑 Family cup) =================
   One cup at a time per player + kind, kept on this device (localStorage) so you can stop and come back.
   You play YOUR team's matches (a normal match at the cup's level + size); every other match is played out by a quick score roll. */
let CUPRUN = null;   // {T, fx, me, opp} while a cup match is on
const CUP_TEAMS = [['🦖', 'Dino Kickers'], ['🐙', 'Octo United'], ['🤖', 'Robo Rovers'], ['🪐', 'Moon Rockets'], ['☁️', 'Cloud City'], ['🌋', 'Lava Lions'], ['🐝', 'Buzz FC'], ['🦈', 'Shark Bay'], ['🦄', 'Unicorn Stars'], ['🐸', 'Hop Town'], ['🦉', 'Owl Athletic'], ['🍕', 'Pizza Pals']];
const CUP_COLS = ['#2F80ED', '#E5484D', '#2DBE6C', '#FF8A1F', '#7A5CFA', '#1FA9D6', '#FFB020', '#E0457B', '#5B6CFF', '#1DB98A', '#B5651D', '#8E44AD'];
const CUP_ROUND = {8: ['Quarter-final', 'Semi-final', 'Final'], 4: ['Semi-final', 'Final'], 2: ['Final']};
function cupKey(kind){ return store('cup:' + kind); }
function cupLoad(kind){ try{ const T = JSON.parse(ls(cupKey(kind)) || 'null'); return T && T.v === 1 ? T : null; }catch(e){ return null; } }
function cupSave(T){ ls(cupKey(T.kind), JSON.stringify(T)); }
function cupClear(kind){ try{ localStorage.removeItem(cupKey(kind)); }catch(e){} }
function shuffle(a){ a = a.slice(); for(let i = a.length - 1; i > 0; i--){ const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
// teams: you (+ for 👑 the family captains) and robot teams with a strength around the level
function cupNew(kind, size, level){
  const me = {id: 0, name: kind === 'family' ? S.player + "'s team" : 'Team ' + S.player, icon: '⭐', col: TEAM_COL[0], me: true, str: level, captain: kind === 'family' ? S.player : null};
  const teams = [me], fam = kind === 'family' ? others().slice(0, 7) : [];
  fam.forEach((n, i) => teams.push({id: teams.length, name: n + "'s team", icon: '👑', col: CUP_COLS[(i + 2) % CUP_COLS.length], captain: n, str: level + (Math.random() - 0.5) * 0.6}));
  const want = kind === 'league' ? 4 : kind === 'family' ? (teams.length <= 4 ? 4 : 8) : 8, pool = shuffle(CUP_TEAMS);
  while(teams.length < want){ const [ic, nm] = pool.pop(); teams.push({id: teams.length, name: nm, icon: ic, col: CUP_COLS[teams.length % CUP_COLS.length], str: level + (Math.random() - 0.5) * 1.2 + (teams.length === want - 1 ? 0.35 : 0)}); }
  const T = {v: 1, kind, size, level, theme: SET.theme, teams, done: false, champ: -1, made: Date.now()};
  if(kind === 'league'){   // round robin, 3 matchdays: (0-1, 2-3) (0-2, 1-3) (0-3, 1-2) — you play every matchday
    const ids = shuffle([1, 2, 3]); T.days = [[[0, ids[0]], [ids[1], ids[2]]], [[0, ids[1]], [ids[0], ids[2]]], [[0, ids[2]], [ids[0], ids[1]]]].map(d => d.map(([a, b]) => ({a, b, ga: null, gb: null})));
    T.day = 0;
  } else { const order = shuffle(teams.map(t => t.id)); T.rounds = [[]]; for(let i = 0; i < order.length; i += 2) T.rounds[0].push({a: order[i], b: order[i + 1], ga: null, gb: null, pens: null}); T.round = 0; }
  return T;
}
// 🎲 the quick score roll for a match you don't play: stronger team scores a bit more often
function poisson(l){ let k = 0, p = Math.exp(-l), t = Math.random(); let c = p; while(t > c && k < 8){ k++; p *= l / k; c += p; } return k; }
function cupRoll(T, fx, knock){
  const A = T.teams[fx.a], B = T.teams[fx.b], d = (A.str - B.str) * 0.28;
  fx.ga = poisson(Math.max(0.35, 1.35 + d)); fx.gb = poisson(Math.max(0.35, 1.35 - d));
  if(knock && fx.ga === fx.gb){ const pa = 0.5 + Math.max(-0.2, Math.min(0.2, d * 0.5)); let a = 3 + (Math.random() < pa ? 1 : 0), b = 3 + (Math.random() < 1 - pa ? 1 : 0); if(a === b) a += Math.random() < pa ? 1 : -1; fx.pens = [Math.max(0, a), Math.max(0, b)]; }
}
function fxWinner(fx){ if(fx.ga == null) return -1; if(fx.ga !== fx.gb) return fx.ga > fx.gb ? fx.a : fx.b; return fx.pens ? (fx.pens[0] > fx.pens[1] ? fx.a : fx.b) : -1; }
function leagueTable(T){
  const R = T.teams.map(t => ({id: t.id, p: 0, w: 0, d: 0, l: 0, gf: 0, ga: 0, pts: 0}));
  (T.days || []).forEach(day => day.forEach(f => { if(f.ga == null) return; const A = R[f.a], B = R[f.b]; A.p++; B.p++; A.gf += f.ga; A.ga += f.gb; B.gf += f.gb; B.ga += f.ga;
    if(f.ga > f.gb){ A.w++; B.l++; A.pts += 3; } else if(f.ga < f.gb){ B.w++; A.l++; B.pts += 3; } else { A.d++; B.d++; A.pts++; B.pts++; } }));
  return R.sort((x, y) => y.pts - x.pts || (y.gf - y.ga) - (x.gf - x.ga) || y.gf - x.gf || x.id - y.id);
}
// the match YOU play next (null = the cup is over for you)
function cupMyFixture(T){
  if(T.done) return null;
  if(T.kind === 'league'){ const day = T.days[T.day]; return day ? day.find(f => (f.a === 0 || f.b === 0) && f.ga == null) || null : null; }
  const r = T.rounds[T.round]; return r ? r.find(f => (f.a === 0 || f.b === 0) && f.ga == null) || null : null;
}
// after your match: roll the others in this round, then build the next round (or crown the champion)
function cupAdvance(T){
  if(T.kind === 'league'){
    const day = T.days[T.day]; day.forEach(f => { if(f.ga == null) cupRoll(T, f, false); });
    T.day++; if(T.day >= T.days.length){ T.done = true; T.champ = leagueTable(T)[0].id; }
    return;
  }
  const r = T.rounds[T.round]; r.forEach(f => { if(f.ga == null) cupRoll(T, f, true); });
  const win = r.map(fxWinner);
  if(win.length === 1){ T.done = true; T.champ = win[0]; return; }
  const nx = []; for(let i = 0; i < win.length; i += 2) nx.push({a: win[i], b: win[i + 1], ga: null, gb: null, pens: null});
  T.rounds.push(nx); T.round++;
  if(!cupMyFixture(T)) cupAdvance(T);   // you're out → the rest of the cup is played out at once
}
function cupRoundName(T){ if(T.kind === 'league') return 'Matchday ' + Math.min(T.day + 1, 3) + ' of 3'; const n = CUP_ROUND[T.rounds[0].length * 2] || []; return n[T.round] || 'Final'; }
function teamTag(T, id, cls){ const t = T.teams[id]; return '<span class="cup-team' + (t.me ? ' me' : '') + (cls ? ' ' + cls : '') + '" style="--tc:' + t.col + '"><i>' + t.icon + '</i>' + UI.esc(t.name) + '</span>'; }
function fxHtml(T, f, i){
  const w = fxWinner(f), sc = f.ga == null ? '<b class="vs">vs</b>' : '<b class="sc">' + f.ga + ' – ' + f.gb + (f.pens ? '<small>pens ' + f.pens[0] + '–' + f.pens[1] + '</small>' : '') + '</b>';
  return '<div class="cup-fx' + (f.a === 0 || f.b === 0 ? ' mine' : '') + '" style="--d:' + (i * 0.06) + 's">' + teamTag(T, f.a, w === f.a ? 'won' : w >= 0 ? 'lost' : '') + sc + teamTag(T, f.b, w === f.b ? 'won' : w >= 0 ? 'lost' : '') + '</div>';
}
function cupSetup(){
  const KD = SET.kind, T = cupLoad(KD), name = MODES.find(m => m.k === KD).name, icon = MODES.find(m => m.k === KD).icon;
  $('setup-logo').textContent = icon; $('setup-title').textContent = icon + ' ' + name + ' · ' + SZ_NAME[SET.size] + ' · ' + BO.LEVELS[SET.level].name;
  $('setup-sub').textContent = KD === 'league' ? '4 teams, you play each one once. Win = 3 points, draw = 1. Top of the table lifts the 🏆!' : KD === 'family' ? '👑 Every family member captains a team (their avatar wears the armband). You play your team\'s matches — the other captains\' matches are played out for you. Win the final to lift the trophy!'
    : '8 teams, knockout: quarter-final → semi-final → final. A draw goes to 🥅 penalties (or a golden goal on the easy levels). Lose and you\'re out!';
  const cont = T && !T.done && T.size === SET.size && T.level === SET.level;
  $('go-btn').textContent = cont ? '▶ Continue: ' + cupRoundName(T) : icon + ' Start the ' + (KD === 'league' ? 'league' : 'cup');
  $('go-btn').onclick = () => { let T2 = cupLoad(KD); if(!(T2 && !T2.done && T2.size === SET.size && T2.level === SET.level)){ T2 = cupNew(KD, SET.size, SET.level); cupSave(T2); } showCup(T2); };
}
function showCup(T){
  CUPRUN = null; hideResult(); $('pads').innerHTML = '';
  const box = $('cup-box'), mine = cupMyFixture(T), name = MODES.find(m => m.k === T.kind).name, icon = MODES.find(m => m.k === T.kind).icon;
  let h = '<div class="title"><div class="logo" id="cup-logo">' + icon + '</div><h1>' + name + '</h1><p>' + SZ_NAME[T.size] + ' · ' + LEVEL_UI[T.level].emoji + ' ' + BO.LEVELS[T.level].name + (T.done ? '' : ' · ' + cupRoundName(T)) + '</p></div>';
  if(T.done){ const c = T.teams[T.champ], meWon = c.me;
    h += '<div class="cup-champ' + (meWon ? ' me' : '') + '"><canvas id="cup-lift" width="220" height="230"></canvas><div><div class="big">🏆</div><h2 class="' + (meWon ? 'cheer' : '') + '">' + (meWon ? 'Champions! ' + UI.esc(c.name) + ' lift the cup!' : c.icon + ' ' + UI.esc(c.name) + ' win the ' + (T.kind === 'league' ? 'league' : 'cup') + '!') + '</h2>' +
      (meWon ? '' : '<p class="note">' + cupHowFar(T) + '</p>') + '</div></div>';
  }
  if(T.kind === 'league'){ const tab = leagueTable(T);
    h += '<table class="cup-table"><tr><th></th><th>Team</th><th>P</th><th>W</th><th>D</th><th>L</th><th>GD</th><th>Pts</th></tr>' + tab.map((r, i) => '<tr' + (T.teams[r.id].me ? ' class="me"' : '') + '><td>' + (i + 1) + '</td><td>' + teamTag(T, r.id) + '</td><td>' + r.p + '</td><td>' + r.w + '</td><td>' + r.d + '</td><td>' + r.l + '</td><td>' + (r.gf - r.ga > 0 ? '+' : '') + (r.gf - r.ga) + '</td><td><b>' + r.pts + '</b></td></tr>').join('') + '</table>';
    h += '<div class="cup-rounds">' + T.days.map((d, i) => '<div class="cup-round' + (i === T.day && !T.done ? ' now' : '') + '"><h3>Matchday ' + (i + 1) + '</h3>' + d.map(fxHtml.bind(null, T)).join('') + '</div>').join('') + '</div>';
  } else {
    const names = CUP_ROUND[T.rounds[0].length * 2] || [];
    h += '<div class="cup-rounds">' + names.map((nm, i) => { const r = T.rounds[i]; return '<div class="cup-round' + (i === T.round && !T.done ? ' now' : '') + '"><h3>' + nm + '</h3>' + (r ? r.map(fxHtml.bind(null, T)).join('') : '<div class="cup-fx tbd">🔒 winners meet here</div>') + '</div>'; }).join('') + '</div>';
  }
  h += '<div class="go-row">' + (mine ? '<button class="btn sp-btn sp-primary sp-lg" id="cup-play" data-sound="pop">⚽ Play: ' + UI.esc(T.teams[mine.a === 0 ? mine.b : mine.a].name) + '</button>' : '') +
    (T.done || !mine ? '<button class="btn sp-btn sp-primary sp-lg" id="cup-new" data-sound="pop">🆕 New ' + (T.kind === 'league' ? 'league' : 'cup') + '</button>' : '') + '</div>';
  box.innerHTML = h; showScreen('cup');
  try{ const lg = logoImg('cup', phoneLand() ? 52 : 74, 'bo-sbadge', ''); if(lg) $('cup-logo').innerHTML = lg; }catch(e){}
  if($('cup-play')) $('cup-play').onclick = () => cupPlay(T);
  if($('cup-new')) $('cup-new').onclick = () => { const T2 = cupNew(T.kind, T.size, T.level); cupSave(T2); showCup(T2); };
  if(T.done){ const c = T.teams[T.champ]; cupLift($('cup-lift'), c); if(c.me && FX) confetti(['🏆', '⭐', '🎉', '⚽'], 40); }
}
function cupHowFar(T){
  if(T.kind === 'league'){ const pos = leagueTable(T).findIndex(r => T.teams[r.id].me) + 1; return 'You finished ' + ['', '1st', '2nd', '3rd', '4th'][pos] + ' — one more go?'; }
  const out = T.rounds.findIndex(r => r.some(f => (f.a === 0 || f.b === 0) && fxWinner(f) !== 0 && fxWinner(f) >= 0)), names = CUP_ROUND[T.rounds[0].length * 2] || [];
  return out >= 0 ? 'You were knocked out in the ' + (names[out] || 'cup').toLowerCase() + ' — one more go?' : '';
}
// 🏆 the winner lifts the cup: a captain's own avatar (or a robot in its team colour) does a star jump with a trophy above the head
function cupLift(c, team){
  if(!c || !window.Acting) return; const g = c.getContext('2d'), av = team.captain ? myAvatar(team.captain) : team.me ? myAvatar(S.player) : defaultAvatar(team.name), t0 = performance.now();
  const R = actRun('celjump'), loop = () => { if(!c.isConnected) return; const t = (performance.now() - t0) / 1000, tot = R ? (R.start[4] + R.D[4].ms) / 1000 + 0.6 : 2, f = R ? R.at(Math.min(t % tot, tot - 0.6)) : null;
    g.clearRect(0, 0, c.width, c.height); g.save(); try{ Acting.draw(g, {name: team.name, av}, c.width / 2, c.height - 18, 1.25, f || 'happy', {t}); }catch(e){} g.restore();
    const up = f && f.pose ? -(f.pose.dy || 0) * 1.25 : 0; g.font = '54px serif'; g.textAlign = 'center'; g.fillText('🏆', c.width / 2, 70 + Math.min(0, -up * 0.5)); requestAnimationFrame(loop); };
  loop();
}
function cupPlay(T){
  const f = cupMyFixture(T); if(!f) return; const oppId = f.a === 0 ? f.b : f.a;
  SET.kind = T.kind; SET.size = T.size; SET.level = T.level; if(T.theme) SET.theme = T.theme;
  CUPRUN = {T, fx: f, me: T.teams[0], opp: T.teams[oppId], meIsA: f.a === 0}; startMatch();
}
function cupAfterMatch(M, mySide){
  const C = G.cup, T = C.T, f = C.fx, my = M.score[mySide], their = M.score[1 - mySide];
  if(C.meIsA){ f.ga = my; f.gb = their; } else { f.ga = their; f.gb = my; }
  if(M.pens && T.kind !== 'league'){ const pm = M.pens.g[mySide], po = M.pens.g[1 - mySide]; f.pens = C.meIsA ? [pm, po] : [po, pm]; }
  if(T.kind !== 'league' && f.ga === f.gb && !f.pens){ const w = M.winner === mySide; f.pens = C.meIsA ? (w ? [1, 0] : [0, 1]) : (w ? [0, 1] : [1, 0]); }   // a golden goal decided it
  cupAdvance(T); cupSave(T); G.cupDone = T;
  const rb = document.querySelector('#result-card .res-btns'); if(rb) rb.innerHTML = '<button class="btn soft sp-btn sp-secondary" id="btn-levels" data-sound="none" onclick="backToMenu()">🎚️ Levels</button><button class="btn sp-btn sp-primary" id="btn-cup" data-sound="pop" onclick="cupBack()">' + (T.done ? '🏆 See the winner' : '🏆 Back to the ' + (T.kind === 'league' ? 'table' : 'cup')) + '</button>';
}
function cupBack(){ const T = G && G.cupDone; if(G) cancelAnimationFrame(G.raf); G = null; V = null; if(T) showCup(T); else backToMenu(); }

/* ================= SETUP ================= */
function openSetup(lvl){
  SET.level = lvl; const L = BO.LEVELS[lvl], Sz = BO.SIZES[SET.size];
  if(LEVEL_UI[lvl].hardcore) SET.who = 'robot';
  $('setup-logo').textContent = SZ_LOGO[SET.size] || '⚽'; $('setup-title').textContent = (SET.size === 5 || SET.size === 1 ? '' : 'Soccer ') + SZ_NAME[SET.size] + ' · ' + L.name;
  $('setup-sub').textContent = Sz.nokeeper ? 'Just you and one robot in a street cage — no keepers, the ball bounces off the fence. 🥜 Nutmeg them (ball through the legs: L when they stand right in front) = a point! First to ' + Sz.firstTo + ' wins · ' + halfTxt(L.half) + ' · a draw = ⚡ next point wins.'
    : (Sz.n + ' players + a 🧤 robot keeper a side. ') + (Sz.court === 'futsal' ? 'Indoor court: the heavy ball stays low · out at the side = a 🦶 kick-in · no offside. ' : '') + (SET.size === 11 ? 'Wide camera — 🔍 zoom in with Z · radar in the corner. ' : '') + '2 halves of ' + halfTxt(L.half) + ' · ' + (L.draw === 'pens' ? 'a draw = 🥅 penalty shootout.' : 'a draw = ⚡ golden goal.');
  const KD = SET.kind || 'match'; $('drill-box').classList.toggle('hidden', KD !== 'skills'); $('form-box').classList.toggle('hidden', KD !== 'match' && KD !== 'party' && !CUP_KINDS.includes(KD)); buildPartySizes(); $('who-box').classList.toggle('hidden', KD === 'skills' || CUP_KINDS.includes(KD));
  $('go-btn').textContent = KD === 'skills' ? '🎯 Start the challenge' : KD === 'shootout' ? '🥅 Start the shootout' : '⚽ Kick off!';
  if(KD === 'skills'){ SET.who = 'robot'; buildDrills(); $('setup-logo').textContent = '🎯'; $('setup-title').textContent = '🎯 Skill challenges · ' + L.name; }
  if(KD === 'battle'){ $('setup-logo').textContent = '🎤'; $('setup-title').textContent = '🎤 Tricks Battle · ' + L.name; $('setup-sub').textContent = 'Your turn: 20 s of tricks ON the beat (the ring closes on you = now!) — J 🦶 stepover · K 🌈 rainbow · L 🌀 around the world · Space 🦵 knee · J + K 🧢 neck stall. 🎮 Left thumb (arrows / WASD): ⬆️ hop · ⬇️ drop · 🔄 spin · 😎 show-off — press one WITH a trick on the same beat = a COMBO (16 of them, big points). A different trick each time builds the combo. 3 judges score 🎵 timing · 🌈 variety · ✨ style — best of 3 rounds. ' + BO.BPM[lvl] + ' beats a minute.'; $('go-btn').textContent = '🎤 Start the battle'; }
  if(KD === 'party'){ $('setup-logo').textContent = '🎉'; $('setup-title').textContent = '🎉 Party ball · ' + SZ_NAME[SET.size] + ' · ' + L.name; $('setup-sub').textContent = '🎉 A wild bomb ball: it bounces like crazy (anything can happen!) and a goal pops it into confetti. ' + $('setup-sub').textContent; }
  if(KD === 'shootout'){ $('setup-logo').textContent = '🥅'; $('setup-title').textContent = '🥅 Penalty shootout · ' + L.name; $('setup-sub').textContent = '5 kicks each, then sudden death. Your kick: shoot (K / 💥) when the sliding 🎯 is where you want. Their kick: dive with Q / E (or ⬅️ ➡️) — or stay in the middle!'; }
  buildWho(); buildForms(); buildLooks(); buildBalls();
  const VIEW_TXT = {auto: '📷 View: Auto', behind: '📷 View: Behind your team', side: '📷 View: From the side', top: '📷 View: From above'};
  const vc = () => { $('view-chip').textContent = VIEW_TXT[SET.view] || VIEW_TXT.auto; $('view-chip').classList.toggle('on', SET.view !== 'auto'); };
  vc(); $('view-chip').onclick = () => { const o = ['auto', 'behind', 'side', 'top']; SET.view = o[(o.indexOf(SET.view) + 1) % 4]; savePrefs(); vc(); UI.toast(SET.view === 'auto' ? '📷 Behind your team when one team has people · from the side for 2 teams' : VIEW_TXT[SET.view].replace('📷 View: ', '📷 ')); };
  if(CUP_KINDS.includes(KD)) cupSetup();   // 🏆 R4a
  else $('go-btn').onclick = () => startMatch();
  showScreen('setup');
}
function drillBest(id, lvl){ try{ return JSON.parse(localStorage.getItem(store('drill:' + id + ':' + lvl)) || 'null'); }catch(e){ return null; } }
function buildDrills(){
  const ids = Object.keys(BO.DRILLS); if(!ids.includes(SET.drill)) SET.drill = ids[0];
  $('drill-list').innerHTML = ids.map(id => { const D = BO.DRILLS[id], b = drillBest(id, SET.level), st = b ? b.stars : 0;
    return '<button class="drill' + (SET.drill === id ? ' on' : '') + '" data-d="' + id + '" data-sound="tap"><b>' + D.name + '</b><i>' + D.about + '</i><span class="st">' + '⭐'.repeat(st) + '<span style="opacity:.3">' + '⭐'.repeat(3 - st) + '</span>' + (b && b.time ? ' · ' + b.time + ' s' : b && b.score ? ' · ' + b.score : '') + '</span></button>'; }).join('');
  $('drill-list').querySelectorAll('.drill').forEach(b => b.onclick = () => { SET.drill = b.dataset.d; savePrefs(); buildDrills(); $('setup-sub').textContent = BO.DRILLS[SET.drill].about + (SET.drill === 'cones' ? ' · ⭐ ' + BO.CONE_STARS[SET.level].join(' / ') + ' s' : ''); });
  $('setup-sub').textContent = BO.DRILLS[SET.drill].about + (SET.drill === 'cones' ? ' · ⭐ ' + BO.CONE_STARS[SET.level].join(' / ') + ' s' : '');
}
function others(){ return S.players.map(p => p.Name).filter(n => n !== S.player); }
function buildWho(){
  const hc = !!BO.LEVELS[SET.level].hardcore, list = [['robot', '🤖 Me vs robots'], ['duo', '👥 2 players · against each other'], ['coop', '🤝 2 players · same team']].filter(([k]) => !(SET.kind === 'battle' && k === 'coop'));
  if(SET.kind === 'battle' && SET.who === 'coop') SET.who = 'robot';
  $('who-row').innerHTML = list.map(([k, n]) => '<button class="chip' + (SET.who === k ? ' on' : '') + '" data-k="' + k + '" data-sound="tap"' + (hc && k !== 'robot' ? ' disabled style="opacity:.45"' : '') + '>' + n + '</button>').join('');
  $('who-row').querySelectorAll('.chip').forEach(b => b.onclick = () => { if(b.disabled){ UI.toast('💀 Hardcore is you vs the robots'); return; } SET.who = b.dataset.k; savePrefs(); buildWho(); });
  const ob = $('opp-box'); if(SET.who === 'robot'){ ob.innerHTML = '<div class="note" style="margin-top:8px">⌨️ W A S D or the arrows · J pass · K shoot · L trick · Space jump · Q / E shout to your keeper</div>'; return; }
  const key = SET.who === 'duo' ? 'opp' : 'mate', names = others().concat(['Guest']); if(!names.includes(SET[key])) SET[key] = names[0];
  ob.innerHTML = '<div class="opp-row"><span class="note">' + (SET.who === 'duo' ? '🔴 Other team:' : '🔵 Your teammate:') + '</span>' + names.map(n => '<button class="chip' + (SET[key] === n ? ' on' : '') + '" data-n="' + UI.esc(n) + '" data-sound="tap">' + (n === 'Guest' ? '🙂 Guest' : UI.esc(n)) + '</button>').join('') + '</div>' +
    '<div class="note" style="margin-top:6px">⌨️ 2nd player: arrows + number pad (1 pass · 2 shoot · 3 trick · 0 jump · Enter switch · 4 / 6 shout) — or each takes a side of the tablet.</div>';
  ob.querySelectorAll('.chip').forEach(b => b.onclick = () => { SET[key] = b.dataset.n; buildWho(); });
}
function buildForms(){
  const Sz = BO.SIZES[SET.size];
  $('form-row').innerHTML = Sz.formOrder.map(f => '<button class="chip' + (SET.form === f ? ' on' : '') + '" data-f="' + f + '" data-sound="tap">' + formIcon(f) + ' ' + Sz.formName[f] + '</button>').join('');
  $('form-row').querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.form = b.dataset.f; savePrefs(); buildForms(); });
}
function buildPartySizes(){   // 🎉 party ball + 🏆 cups: pick the match size here
  let row = $('psize-row'); if(!row){ row = document.createElement('div'); row.className = 'chips'; row.id = 'psize-row'; row.style.marginBottom = '8px'; $('form-row').before(row); }
  if(SET.kind !== 'party' && !CUP_KINDS.includes(SET.kind)){ row.innerHTML = ''; row.classList.add('hidden'); return; } row.classList.remove('hidden');
  row.innerHTML = (SET.kind === 'party' ? PARTY_SIZES : CUP_SIZES).map(z => '<button class="chip' + (SET.size === z ? ' on' : '') + '" data-z="' + z + '" data-sound="tap">' + SZ_LOGO[z] + ' ' + SZ_NAME[z] + '</button>').join('');
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.size = +b.dataset.z; fixForm(); savePrefs(); openSetup(SET.level); });
}
function buildTwist(){   // 🎪 fun pitch twists: 🔥 Intermediate up, switch on / off
  let row = $('twist-row'); if(!row){ row = document.createElement('div'); row.className = 'chips'; row.id = 'twist-row'; row.style.marginTop = '8px'; $('night-row').after(row); }
  const T = BO.TWISTS[SET.theme]; if(!T){ row.innerHTML = ''; return; }
  if(SET.level < 2){ row.innerHTML = '<span class="note">🎪 ' + T.icon + ' ' + T.name + ' — the fun pitch twist starts at 🔥 Intermediate</span>'; return; }
  row.innerHTML = '<button class="chip' + (SET.twist ? ' on' : '') + '" data-t="1" data-sound="tap">🎪 Fun pitch: ' + T.icon + ' ' + T.name + '</button><button class="chip' + (!SET.twist ? ' on' : '') + '" data-t="0" data-sound="tap">⚽ Plain pitch</button><span class="note" style="flex-basis:100%">' + T.about + '</span>';
  row.querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.twist = b.dataset.t === '1'; savePrefs(); buildTwist(); });
}
function formIcon(f){ return {'121': '🔷', '22': '🟦', '31': '📌', '1': '🧍', '231': '🔺', '321': '🛡️', '442': '🧱', '433': '⚔️', '352': '🎯'}[f] || '📋'; }
function buildLooks(){
  const box = $('look-list');
  if(!box.children.length){
    LOOK_KEYS.forEach(k => { const b = document.createElement('button'); b.className = 'look'; b.dataset.k = k; b.setAttribute('data-sound', 'tap');
      const c = document.createElement('canvas'); c.width = 200; c.height = 150; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<div class="nm">' + LOOKS[k].icon + ' ' + LOOKS[k].name + '</div>');
      b.onclick = () => { SET.theme = k; savePrefs(); markLooks(); }; box.appendChild(b); });
  }
  box.querySelectorAll('.look').forEach(b => drawLookPreview(b.querySelector('canvas'), b.dataset.k));
  markLooks();
}
function markLooks(){
  try{ paintLogos(); }catch(e){}
  $('look-list').querySelectorAll('.look').forEach(b => b.classList.toggle('on', b.dataset.k === SET.theme));
  buildTwist(); const nr = $('night-row'); if(SET.theme !== 'classic'){ nr.innerHTML = ''; return; }
  nr.innerHTML = '<button class="chip' + (!SET.night ? ' on' : '') + '" data-n="0" data-sound="tap">☀️ Day match</button><button class="chip' + (SET.night ? ' on' : '') + '" data-n="1" data-sound="tap">🌙 Night match</button>';
  nr.querySelectorAll('.chip').forEach(b => b.onclick = () => { SET.night = b.dataset.n === '1'; savePrefs(); markLooks(); drawLookPreview($('look-list').querySelector('.look[data-k="classic"] canvas'), 'classic'); });
}
function buildBalls(){
  const box = $('ball-list'), have = ownedBalls(); box.innerHTML = '';
  const add = (v, nm) => { const b = document.createElement('button'); b.className = 'ballc' + (SET.ball === v ? ' on' : ''); b.setAttribute('data-sound', 'tap');
    const c = document.createElement('canvas'); c.width = c.height = 80; b.appendChild(c); b.insertAdjacentHTML('beforeend', '<span>' + UI.esc(nm) + '</span>');
    const g = c.getContext('2d'); if(v < 0) drawSoccerBall(g, 40, 40, 28, 0.6); else BallSkins.draw(g, v, 40, 40, 28, 1);
    b.onclick = () => { SET.ball = v; ls('sp_ball:' + S.player, String(v)); buildBalls(); }; box.appendChild(b); };
  add(-1, 'Classic'); for(let i = 0; i < have; i++) add(i, (BallSkins.NAMES || [])[i] || 'Skin ' + (i + 1));
  if(!have) box.insertAdjacentHTML('beforeend', '<div class="note" style="align-self:center">🎁 More balls: earn ball skins in the Collection</div>');
}
/* ⌨️ keys per device (swap on clash), saved per player */
function keyName(code){ if(!code) return '—'; return code.replace(/^Key/, '').replace(/^Digit/, '').replace(/^Numpad/, 'Num ').replace('Arrow', '').replace('ShiftLeft', 'L-Shift').replace('ShiftRight', 'R-Shift').replace('Space', 'Space').replace('Enter', '⏎'); }
function loadKeys(){ let k = null; try{ k = JSON.parse(ls(store('keys')) || 'null'); }catch(e){} return DEFAULT_KEYS.map((d, i) => Object.assign({}, d, (k && k[i]) || {})); }
function saveKeys(){ ls(store('keys'), JSON.stringify(KEYS)); }
let keyWait = null;
function openKeys(){ renderKeys(); $('keys-sheet').classList.remove('hidden'); }
function closeKeys(){ keyWait = null; $('keys-sheet').classList.add('hidden'); }
function resetKeys(){ KEYS = DEFAULT_KEYS.map(d => Object.assign({}, d)); saveKeys(); renderKeys(); }
function renderKeys(){
  $('keys-table').innerHTML = '<div class="krow"><span></span><span>🔵 Player 1</span><span>🟣 Player 2</span></div>' + ACTIONS.map(([a, n]) => '<div class="krow"><span>' + n + '</span>' + [0, 1].map(s => '<button class="keybtn' + (keyWait && keyWait.s === s && keyWait.a === a ? ' wait' : '') + '" data-s="' + s + '" data-a="' + a + '">' + (keyWait && keyWait.s === s && keyWait.a === a ? 'press…' : UI.esc(keyName(KEYS[s][a]))) + '</button>').join('') + '</div>').join('');
  $('keys-table').querySelectorAll('.keybtn').forEach(b => b.onclick = () => { keyWait = {s: +b.dataset.s, a: b.dataset.a}; renderKeys(); });
}
function takeKey(e){
  if(!keyWait) return false; e.preventDefault(); if(e.code === 'Escape'){ keyWait = null; renderKeys(); return true; }
  const {s, a} = keyWait, old = KEYS[s][a];
  KEYS.forEach((K, si) => Object.keys(K).forEach(k => { if(K[k] === e.code && !(si === s && k === a)) K[k] = old; }));   // swap on clash
  KEYS[s][a] = e.code; keyWait = null; saveKeys(); renderKeys(); UISound.play('pop'); return true;
}

/* ================= 🔊 a few soccer sounds (own little synth, follows the sound switch) ================= */
let AC = null;
function ac(){ try{ if(!UISound.get().enabled) return null; if(!AC) AC = new (window.AudioContext || window.webkitAudioContext)(); if(AC.state === 'suspended') AC.resume(); return AC; }catch(e){ return null; } }
function sfx(kind, vol){
  const a = ac(); if(!a || !FX) return; const t = a.currentTime, g = a.createGain(); g.connect(a.destination); vol = (vol == null ? 1 : vol) * 0.35;
  if(kind === 'kick' || kind === 'thud'){ const o = a.createOscillator(); o.type = 'sine'; o.frequency.setValueAtTime(kind === 'kick' ? 170 : 110, t); o.frequency.exponentialRampToValueAtTime(45, t + 0.12); g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.15); o.connect(g); o.start(t); o.stop(t + 0.16); return; }
  if(kind === 'whistle'){ const o = a.createOscillator(), l = a.createOscillator(), lg = a.createGain(); o.type = 'sine'; o.frequency.value = 2650; l.frequency.value = 38; lg.gain.value = 120; l.connect(lg); lg.connect(o.frequency); g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * 0.35, t + 0.02); g.gain.setValueAtTime(vol * 0.35, t + 0.32); g.gain.linearRampToValueAtTime(0.0001, t + 0.4); o.connect(g); o.start(t); l.start(t); o.stop(t + 0.42); l.stop(t + 0.42); return; }
  if(kind === 'roar' || kind === 'ooh'){ const n = a.createBufferSource(), len = kind === 'roar' ? 2.2 : 0.9, buf = a.createBuffer(1, Math.floor(a.sampleRate * len), a.sampleRate), d = buf.getChannelData(0); for(let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    n.buffer = buf; const f = a.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = kind === 'roar' ? 900 : 500; f.Q.value = 0.7; g.gain.setValueAtTime(0.0001, t); g.gain.linearRampToValueAtTime(vol * (kind === 'roar' ? 0.9 : 0.5), t + 0.25); g.gain.linearRampToValueAtTime(0.0001, t + len); n.connect(f); f.connect(g); n.start(t); return; }
}

/* ================= MATCH ================= */
function kitAv(av, side, gk){ const a = JSON.parse(JSON.stringify(fixAv(av))); a.outfit = 0; a.outfitColor = gk ? KEEPER_KIT[side] : TEAM_KIT[side]; a.oc2 = 0; a.eq = {}; return a; }   // 👕 team kit: same shirt for the whole team (the kit line comes in R4); no ride-ons / held things on the pitch
function startMatch(){
  hideResult(); savePrefs();
  const kind0 = SET.kind || 'match', kind = CUP_KINDS.includes(kind0) ? 'match' : kind0; if(kind === 'skills' || (kind === 'battle' && SET.who === 'coop') || kind0 !== kind) SET.who = 'robot';
  if(!CUP_KINDS.includes(kind0)) CUPRUN = null;
  const size = SET.size, lv = SET.level, Sz = BO.SIZES[size], L = BO.LEVELS[lv], humans = [{name: S.player, side: 0, seat: 0}];
  if(SET.who === 'duo') humans.push({name: SET.opp || 'Guest', side: 1, seat: 1});
  if(SET.who === 'coop') humans.push({name: SET.mate || 'Guest', side: 0, seat: 1});
  const names = [[], []], bots = ROBO_NAMES.slice().sort(() => Math.random() - 0.5);
  for(let s = 0; s < 2; s++){ names[s].push(s ? 'Robo Keeper' : 'Keeper'); for(let i = 0; i < Sz.n; i++) names[s].push(bots[(s * Sz.n + i) % bots.length]); }
  // people play the forward(s) (the engine gives each person the last free outfield player of their side)
  const perSide = [0, 0]; humans.forEach(h => { const idx = Sz.n - perSide[h.side]; names[h.side][idx] = h.name; perSide[h.side]++; });
  const robotForm = Sz.formOrder[Math.floor(Math.random() * Sz.formOrder.length)];
  const M = BO.newMatch({size, level: lv, seed: (Date.now() & 0xffffff) ^ 0xb0, form0: SET.form, form1: SET.who === 'duo' ? Sz.formOrder[0] : robotForm, theme: SET.theme, names, humans, fast: !!window.BO_FAST, half: window.BO_HALF || 0, pensOnly: kind === 'shootout', party: kind === 'party', twist: SET.twist, league: !!(CUPRUN && CUPRUN.T.kind === 'league')});
  if(kind === 'skills') BO.drill(M, SET.drill);
  if(kind === 'battle') BO.battleStart(M);
  const teamName = s => { const hs = humans.filter(h => h.side === s).map(h => h.name); return hs.length ? hs.join(' + ') : ROBO_TEAMS[lv]; };
  G = {party: kind === 'party' ? partySkin(M) : null, M, L, Sz, size, level: lv, kind, drill: kind === 'skills' ? SET.drill : null, theme: SET.theme, night: SET.theme === 'classic' && SET.night, ball: SET.ball, humans, mode: SET.who, tn: CUPRUN ? [CUPRUN.me.name, CUPRUN.opp.name] : [teamName(0), teamName(1)], cup: CUPRUN, captain: CUPRUN && CUPRUN.T.kind === 'family' ? S.player : null,
    avs: M.players.map(p => { const h = humans.find(x => x.name === p.name && x.side === p.side); return kitAv(h ? myAvatar(h.name === 'Guest' ? 'Guest' : h.name) : defaultAvatar(p.name + '·robo' + p.side), p.side, p.gk); }),
    spr: M.players.map(() => ({})), t0: performance.now(), last: performance.now(), acc: 0, paused: false, over: false, raf: 0, held: new Set(), sticks: new Map(), btn: new Map(),
    cam: null, anim: 0, sq: size === 11 ? 1.0 : size === 1 ? 1.6 : 1.3,   /* 🎤 the battle dancers are drawn live (bo-5c) — sharp without big pictures */ zoom: ls(store('zoom' + size)) === '1', startAt: performance.now(), shoutShow: [0, 0], guideHand: true, lastScore: '', endAt: 0, help: L.guided, floatQ: []};
  G.view = viewMode();
  GameComic._reset();
  G.lvFull = (kind === 'skills' ? BO.DRILLS[SET.drill].name : kind === 'shootout' ? '🥅 Penalties' : kind === 'battle' ? '🎤 Tricks Battle' : kind === 'party' ? '🎉 Party ' + SZ_NAME[size] : (SZ_LOGO[size] || '⚽') + ' ' + SZ_NAME[size]) + ' · ' + LEVEL_UI[lv].emoji + ' ' + L.name;
  G.lvShort = (kind === 'skills' ? [...BO.DRILLS[SET.drill].name][0] : kind === 'shootout' ? '🥅' : kind === 'battle' ? '🎤' : kind === 'party' ? '🎉' : (SZ_LOGO[size] || '⚽')) + ' ' + LEVEL_UI[lv].emoji;
  if(CUPRUN){ G.lvFull = '🏆 ' + cupRoundName(CUPRUN.T) + ' · ' + G.lvFull; G.lvShort = '🏆 ' + G.lvShort; }   // 🏆 R4a: the bar names the cup round
  barLevel();
  BAR.players([0, 1].map(i => ({k: i, av: (Array.from(G.tn[i] || '?')[0] || '?').toUpperCase(), name: G.tn[i], score: 0, col: TEAM_COL[i]})));
  BAR.time(fmt(M.halfLen)); BAR.round(1, Sz.oneHalf ? 1 : 2); if(L.stamina) BAR.meter('sta', '💨', 1, 'Stamina — sprinting uses it up');
  showScreen('play'); BAR.fit(); resize(); buildPads(); checkTurn(); if(kind === 'battle') battlePads();
  if(M.twist && FX) setTimeout(() => { if(G && G.M === M) banner('🎪 ' + BO.TWISTS[M.twist].icon + ' ' + BO.TWISTS[M.twist].name + ' — ' + BO.TWISTS[M.twist].about, 'gold'); }, 2400);
  if(kind === 'party') banner('🎉 Party ball! It bounces like crazy — score to pop it!', 'gold'); else if(kind !== 'match') ; else banner(Sz.nokeeper ? '🏙️ First to ' + Sz.firstTo + '! Score in the little 🥅 — or 🥜 nutmeg them (L)' : '⚽ Kick off! ' + (L.guided ? 'Run to the ball and score in the 🥅!' : 'First half — ' + fmt(M.halfLen)), 'good');
  sfx('whistle'); say('Blas off! Kick off!');
  G.raf = requestAnimationFrame(frame);
}
function viewMode(){
  const sides = new Set(G.humans.map(h => h.side)), want = SET.view || 'auto';
  if(want === 'side' || want === 'top') return {mode: want, side: 0};
  if(want === 'behind') return {mode: 'behind', side: G.humans[0].side};
  return sides.size === 1 ? {mode: 'behind', side: [...sides][0]} : {mode: 'side', side: 0};
}

/* ---------- 📷 camera: one real perspective camera (behind your team · side · top) that follows the ball ---------- */
function isTouch(){ return ('ontouchstart' in window) || (navigator.maxTouchPoints || 0) > 0; }
function phoneUpright(){ return isTouch() && innerHeight > innerWidth && innerWidth < 600; }
function padBox(w, h){
  const box = {l: 0, r: 0, t: 0, b: 0}; if(!isTouch() || !G) return box;
  const two = touchCtrls().length > 1, short = h < 520 && w > h;
  if(two){ const sw = Math.min(150, h * 0.3) + 20; box.l = sw; box.r = sw; }
  else if(short){ box.l = Math.min(118, h * 0.27) + 12; box.r = Math.min(124, h * 0.29) + 10; }   /* 📱 bo-3d: smaller pads on phones held sideways */
  else box.b = Math.min(170, Math.max(120, Math.min(w, h) * 0.2));
  return box;
}
function resize(){
  const cv = $('pitch'), st = $('stage'), dpr = Math.min(2, window.devicePixelRatio || 1), w = st.clientWidth, h = st.clientHeight;
  cv.width = Math.max(10, Math.round(w * dpr)); cv.height = Math.max(10, Math.round(h * dpr));
  if(G){ G.W = w; G.H = h; G.dpr = dpr; G.box = padBox(w, h); G.cam = null; st.style.setProperty('--padh', G.box.b + 'px'); st.style.setProperty('--pads', Math.max(G.box.l + 48, G.box.r) + 'px'); }
  const pl = phoneLand(); st.classList.toggle('pl', pl);
  if(G && G.barPL !== pl){ G.barPL = pl; BAR.hide('round', pl); BAR.hide('star', pl); barLevel(); }   /* 📱 Aowu 18:12: phone sideways = ONE top row (no 🔁 half chip, no 🔥 meter — the Shoot button burns when it's full) */
}
function barLevel(){ if(!G || !G.lvFull) return; const L = G.L; BAR.level(phoneLand() ? G.lvShort : G.lvFull, L && L.hardcore ? 'hc' : ''); }   /* 📱 Aowu 16:28: sideways phone = short level chip ("🎉 7v7 · 🐣") so the score stays in the ONE top row */
function phoneLand(){ return innerHeight < 520 && innerWidth > innerHeight; }
window.addEventListener('resize', () => { if(G){ resize(); buildPads(); checkTurn(); } });
(function(){   // 📱 ls-1b OWN SIDEWAYS GUARD (pattern from the ✨ polish chat): iPhone sideways can skip the last 'resize' → watch the play screen itself
  if(!window.ResizeObserver) return;
  const box = id => { const e = document.getElementById(id); return e ? e.clientWidth + 'x' + e.clientHeight : '-'; };
  const watch = (scr, boxes, ok, run) => { let last = null, n = 0, t0 = 0, later = 0;
    const check = () => { const s = document.getElementById(scr);
      if(!s || s.classList.contains('hidden') || !ok()){ last = null; return; }          // only while that screen is open
      const k = [scr].concat(boxes).map(box).join('|'); if(k === last) return;                          // same size → nothing (no loops)
      const now = Date.now(); if(now - t0 > 1000){ t0 = now; n = 0; }
      if(++n > 4){ if(!later) later = setTimeout(() => { later = 0; check(); }, 1000); return; }   // safety net: ≤ 4 runs a second
      last = k; const R = window.LS1B_RUNS || (window.LS1B_RUNS = {}); R[scr] = (R[scr] || 0) + 1;
      try{ run(); }catch(e){ if(window.console) console.warn('ls-1b', scr, e); } };
    const ro = new ResizeObserver(check); [scr].concat(boxes).forEach(id => { const e = document.getElementById(id); if(e) ro.observe(e); }); };
  watch('scr-play', [], () => !!G, () => { resize(); buildPads(); checkTurn(); });
})();   // 📱 ls-1b END
const NEAR = 0.4;
function makeView(W, H, box, eye, look, fovMode){
  const iw = Math.max(40, W - box.l - box.r), ih = Math.max(40, H - box.t - box.b), cx = box.l + iw / 2, cy = box.t + ih / 2;
  let fx = look[0] - eye[0], fy = look[1] - eye[1], fz = look[2] - eye[2]; const fm = Math.hypot(fx, fy, fz); fx /= fm; fy /= fm; fz /= fm;
  let rx = fy, ry = -fx, rz = 0; const rm = Math.hypot(rx, ry) || 1; rx /= rm; ry /= rm;   // right = forward × up(z)
  const ux = ry * fz - rz * fy, uy = rz * fx - rx * fz, uz = rx * fy - ry * fx;
  const portrait = ih > iw * 1.05, F = portrait ? (iw / 2) / Math.tan(0.62) : (ih / 2) / Math.tan(fovMode === 'top' ? 0.5 : 0.44);
  const toC = (x, y, z) => { const dx = x - eye[0], dy = y - eye[1], dz = (z || 0) - eye[2]; return [dx * rx + dy * ry + dz * rz, dx * ux + dy * uy + dz * uz, dx * fx + dy * fy + dz * fz]; };
  const proj = c => [cx + F * c[0] / c[2], cy - F * c[1] / c[2], c[2]];
  const P = (x, y, z) => { const c = toC(x, y, z); return c[2] > NEAR ? proj(c) : null; };
  const sc = (x, y, z) => { const c = toC(x, y, z); return c[2] > NEAR ? F / c[2] : 0; };
  // a screen direction (keys / stick) → the world direction that looks like it on screen (round the ground point the camera looks at)
  const k2w = (sx, sy) => { const m = Math.hypot(sx, sy); if(m < 1e-6) return {x: 0, y: 0}; const o = P(look[0], look[1], 0), a = P(look[0] + 1, look[1], 0), b = P(look[0], look[1] + 1, 0); if(!o || !a || !b) return {x: sx, y: sy};
    const j11 = a[0] - o[0], j21 = a[1] - o[1], j12 = b[0] - o[0], j22 = b[1] - o[1], det = j11 * j22 - j12 * j21 || 1e-6; let wx = (j22 * sx - j12 * sy) / det, wy = (-j21 * sx + j11 * sy) / det; const wm = Math.hypot(wx, wy) || 1; return {x: wx / wm * m, y: wy / wm * m}; };
  return {W, H, box, F, cx, cy, eye, look, toC, proj, P, sc, k2w, portrait};
}
const PL_FAR = 0.55;   /* 📱 Aowu 16:27: on a sideways phone the 📷 above camera comes ~1.8× closer (players were 11–25 px tall; the side camera: half the distance, below) */
function updateCam(dt){
  const M = G.M, Sz = G.Sz, b = M.ball, vm = G.view, d = BO.dirOf(vm.side, M), k = Sz.cam * (G.W && G.H > G.W ? 1.25 : 1) * (phoneLand() ? (vm.mode === 'top' ? PL_FAR : 0.88) : 1) * (G.zoom ? (Sz.cam > 1.5 ? 0.55 : 0.75) : 1);
  let wx = b.x + b.vx * 0.3, wy = b.y;
  if(M.phase === 'pens' && M.pens){ wx = d * 0 + BO.dirOf(M.pens.turn, G.M) * (Sz.Lh - Sz.spot * 0.6); wy = 0; }
  const c = G.cam || (G.cam = {x: wx, y: wy});
  const s = Math.min(1, dt * 3.2); c.x += (wx - c.x) * s; c.y += (wy - c.y) * s;
  let eye, look;
  if(vm.mode === 'behind'){
    const tx = lim(c.x, -Sz.Lh + 5 * k, Sz.Lh - 7 * k), ty = lim(c.y * 0.72, -Sz.Wh * 0.5, Sz.Wh * 0.5);
    eye = [tx - d * 13 * k, ty, 9.6 * k]; look = [tx + d * 4.5 * k, ty, 0];
  } else if(vm.mode === 'top'){
    const tx = lim(c.x, -Sz.Lh + 9 * k, Sz.Lh - 9 * k), ty = lim(c.y * 0.6, -Sz.Wh * 0.4, Sz.Wh * 0.4);
    eye = [tx, ty - 7 * k, 30 * k]; look = [tx, ty + 1, 0];
  } else {
    const pl = phoneLand(), Df = pl ? 0.5 : 1, tx = lim(c.x, -Sz.Lh + 11 * k * Df, Sz.Lh - 11 * k * Df), ly = pl ? lim(c.y * 0.6, -Sz.Wh * 0.45, Sz.Wh * 0.45) - Sz.Wh * 0.08 : -Sz.Wh * 0.08;   /* 📱 sideways phone: half the distance, follows the ball across */
    eye = [tx, ly - (Sz.Wh * 0.92 + 13 * k) * Df, 12.5 * k * Df]; look = [tx, ly, 0];
  }
  V = makeView(G.W, G.H, G.box, eye, look, vm.mode);
}

/* ---------- 🎨 drawing ---------- */
function clipPoly(V, pts){   // world polygon → screen polygon, cut at the camera's near plane
  const C = pts.map(p => V.toC(p[0], p[1], p[2] || 0)), out = [];
  for(let i = 0; i < C.length; i++){ const a = C[i], b = C[(i + 1) % C.length], ai = a[2] > NEAR, bi = b[2] > NEAR;
    if(ai) out.push(V.proj(a)); if(ai !== bi){ const t = (NEAR - a[2]) / (b[2] - a[2]); out.push(V.proj([a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, NEAR])); } }
  return out;
}
function fillPoly(g, V, pts, col){ const q = clipPoly(V, pts); if(q.length < 3) return; g.beginPath(); g.moveTo(q[0][0], q[0][1]); for(let i = 1; i < q.length; i++) g.lineTo(q[i][0], q[i][1]); g.closePath(); g.fillStyle = col; g.fill(); }
function segW(g, V, a, b){ let A = V.toC(a[0], a[1], a[2] || 0), B = V.toC(b[0], b[1], b[2] || 0); if(A[2] <= NEAR && B[2] <= NEAR) return; if(A[2] <= NEAR){ const t = (NEAR - A[2]) / (B[2] - A[2]); A = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, NEAR]; } else if(B[2] <= NEAR){ const t = (NEAR - B[2]) / (A[2] - B[2]); B = [B[0] + (A[0] - B[0]) * t, B[1] + (A[1] - B[1]) * t, NEAR]; }
  const p = V.proj(A), q = V.proj(B); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); }
function polyline(g, V, pts){ for(let i = 0; i < pts.length - 1; i++) segW(g, V, pts[i], pts[i + 1]); }
function arcPts(cx, cy, r, a0, a1, n){ const o = []; for(let i = 0; i <= n; i++){ const a = a0 + (a1 - a0) * i / n; o.push([cx + Math.cos(a) * r, cy + Math.sin(a) * r, 0]); } return o; }
function gEll(V, x, y, R){ const c = V.P(x, y, 0); if(!c) return null; const s = V.sc(x, y, 0); const a = V.P(x + R, y, 0), b = V.P(x, y + R, 0); if(!a || !b) return [c[0], c[1], R * s, R * s * 0.4]; return [c[0], c[1], Math.max(1, Math.hypot(a[0] - c[0], b[0] - c[0])), Math.max(0.6, Math.hypot(a[1] - c[1], b[1] - c[1]))]; }
// the world: sky, ground, stands + crowd, ad boards, pitch, lines (players + ball + goals are drawn by depth after this)
function drawWorld(g, V, Lk, Sz, t, night){
  const W = V.W, H = V.H, Lh = Sz.Lh, Wh = Sz.Wh;
  const sky = night && Lk.skyN ? Lk.skyN : Lk.sky, gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, sky[0]); gr.addColorStop(1, sky[1]); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if(Lk.stars || night){ g.fillStyle = 'rgba(255,255,255,0.8)'; for(let i = 0; i < 40; i++){ const x = (i * 97.3) % W, y = (i * 53.7) % (H * 0.45); g.fillRect(x, y, 1.6, 1.6); } }
  // deco far away (volcano, Earth, temple…)
  (Lk.deco || []).forEach(([ch, x, y, z, s], i) => { const dx = Lk.drones ? Math.sin(t * 0.6 + i) * 6 : Lk.clouds ? Math.sin(t * 0.2 + i) * 4 : 0; const p = V.P(x + dx, y + Wh, z + (Lk.drones ? Math.sin(t * 1.3 + i) : 0)); if(p) emo(g, ch, p[0], p[1], Math.max(10, V.sc(x, y + Wh, z) * s), 0.95); });
  fillPoly(g, V, [[-Lh - 140, -Wh - 140], [Lh + 140, -Wh - 140], [Lh + 140, Wh + 140], [-Lh - 140, Wh + 140]], night ? shadeHex(Lk.out, -0.35) : Lk.out);
  const CT = Sz.court, CAGE = CT === 'cage', FUT = CT === 'futsal';
  if(CAGE){   // 🏙️ the street: asphalt all round + blocks of flats behind the fence
    fillPoly(g, V, [[-Lh - 140, -Wh - 140], [Lh + 140, -Wh - 140], [Lh + 140, Wh + 140], [-Lh - 140, Wh + 140]], shadeHex(Lk.cage[0], night ? -0.5 : -0.25));
    const wall = shadeHex(Lk.stand, night ? -0.25 : 0.05), win = night ? '#FFE27A' : 'rgba(255,255,255,0.55)', R = [[0, 1, Lh + 10, Wh + 9], [0, -1, Lh + 10, Wh + 9], [1, 0, Wh + 10, Lh + 9], [-1, 0, Wh + 10, Lh + 9]];
    R.forEach(([ax, ay, half, dist], si) => { for(let u = -half, k = 0; u < half; k++){ const w = 4 + ((k * 7 + si * 3) % 4), h = 7 + ((k * 5 + si) % 6) * 2.2, u1 = Math.min(half, u + w);
      const P0 = ax ? [ax * dist, u] : [u, ay * dist], P1 = ax ? [ax * dist, u1] : [u1, ay * dist];
      fillPoly(g, V, [[P0[0], P0[1], 0], [P1[0], P1[1], 0], [P1[0], P1[1], h], [P0[0], P0[1], h]], (k + si) % 3 ? wall : shadeHex(wall, -0.15));
      for(let z = 2; z < h - 1; z += 2.6) for(let q = 0.25; q < 0.9; q += 0.33){ const A = [P0[0] + (P1[0] - P0[0]) * q, P0[1] + (P1[1] - P0[1]) * q], Bq = q + 0.16, B = [P0[0] + (P1[0] - P0[0]) * Bq, P0[1] + (P1[1] - P0[1]) * Bq];
        if((k * 3 + Math.round(z) + Math.round(q * 9)) % 4) fillPoly(g, V, [[A[0], A[1], z], [B[0], B[1], z], [B[0], B[1], z + 1.2], [A[0], A[1], z + 1.2]], win); }
      u = u1 + 0.6; } });
  }
  if(FUT) fillPoly(g, V, [[-Lh - 3, -Wh - 2.4], [Lh + 3, -Wh - 2.4], [Lh + 3, Wh + 2.4], [-Lh - 3, Wh + 2.4]], night ? shadeHex(Lk.courtOut, -0.3) : Lk.courtOut);
  // stands (4 sides) with a crowd — the futsal hall's are close to the court, the street cage has none
  const st = night ? shadeHex(Lk.stand, -0.2) : Lk.stand, ex = Lh + (FUT ? 4 : 7), ey = Wh + (FUT ? 3.4 : 5);
  if(!CAGE){
  [[[-ex, ey, 0], [ex, ey, 0], [ex, ey + 12, 8], [-ex, ey + 12, 8]], [[-ex, -ey, 0], [ex, -ey, 0], [ex, -ey - 12, 8], [-ex, -ey - 12, 8]],
   [[ex, -ey, 0], [ex, ey, 0], [ex + 12, ey, 8], [ex + 12, -ey, 8]], [[-ex, -ey, 0], [-ex, ey, 0], [-ex - 12, ey, 8], [-ex - 12, -ey, 8]]].forEach(q => fillPoly(g, V, q, st));
  crowd(g, V, Lk, Sz, t, night); }
  // floodlights
  if(Lk.lamps && !CT){ [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([sx, sy]) => { const a = V.P(sx * (ex + 6), sy * (ey + 8), 0), b = V.P(sx * (ex + 6), sy * (ey + 8), 18); if(!a || !b) return; g.strokeStyle = '#8A93A8'; g.lineWidth = Math.max(1, V.sc(sx * ex, sy * ey, 9) * 0.35); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
    const r = Math.max(6, V.sc(sx * ex, sy * ey, 18) * (night ? 6 : 2.2)), rg = g.createRadialGradient(b[0], b[1], 1, b[0], b[1], r); rg.addColorStop(0, night ? 'rgba(255,250,220,0.95)' : 'rgba(255,255,255,0.9)'); rg.addColorStop(1, 'rgba(255,250,220,0)'); g.fillStyle = rg; g.beginPath(); g.arc(b[0], b[1], r, 0, 7); g.fill(); }); }
  // ad boards with the Playground's game names
  const by = Wh + (FUT ? 1.6 : 2.2), segL = FUT ? 6 : 8;
  if(!CAGE) for(const side of [-1, 1]) for(let x = -Lh - 4, i = 0; x < Lh + 4; x += segL, i++){
    fillPoly(g, V, [[x, side * by, 0], [x + segL - 0.3, side * by, 0], [x + segL - 0.3, side * by, 0.9], [x, side * by, 0.9]], Lk.boards[(i + (side > 0 ? 1 : 0)) % Lk.boards.length]);
    const c = V.P(x + segL / 2, side * by, 0.45); if(c && c[2] < 70){ const s = V.sc(x + segL / 2, side * by, 0.45); if(s > 3 && s < 34){ g.fillStyle = '#fff'; g.font = '700 ' + Math.round(s * 0.55) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(ADS[(i * 3 + (side > 0 ? 1 : 0)) % ADS.length], c[0], c[1]); } }
  }
  // the pitch: stripes, then the lines
  const n = FUT ? 20 : CAGE ? 8 : 12, dx = 2 * Lh / n, floor = FUT ? Lk.court : CAGE ? Lk.cage : Lk.grass;
  if(FUT) for(let i = 0; i < n; i++) fillPoly(g, V, [[-Lh - 0.01, -Wh + i * Wh / 10], [Lh, -Wh + i * Wh / 10], [Lh, -Wh + (i + 1) * Wh / 10], [-Lh - 0.01, -Wh + (i + 1) * Wh / 10]], night ? shadeHex(floor[i % 2], -0.12) : floor[i % 2]);   // 🪵 floor planks along the court
  else for(let i = 0; i < n; i++) fillPoly(g, V, [[-Lh + i * dx, -Wh], [-Lh + (i + 1) * dx, -Wh], [-Lh + (i + 1) * dx, Wh], [-Lh + i * dx, Wh]], night ? shadeHex(floor[i % 2], -0.12) : floor[i % 2]);
  if(Lk.craters && !CT) [[-8, 5, 2.2], [9, -6, 1.6], [14, 7, 1.2], [-15, -8, 1.8]].forEach(([x, y, r]) => { const e = gEll(V, x * Sz.Lh / 21, y * Sz.Wh / 13.5, r); if(e){ g.fillStyle = 'rgba(70,70,90,0.28)'; g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, 7); g.fill(); } });
  if(Lk.tint){ g.fillStyle = Lk.tint; g.fillRect(0, 0, W, H); }
  const lw = Math.max(1, Math.min(V.sc(V.look[0], V.look[1], 0) * 0.12, 7));   /* bo-2c: width from the point the camera looks at (the centre spot can be right under the camera) */
  const lines = () => { g.beginPath();
    if(CT){ courtLines(g, V, Sz); g.stroke(); return; }
    polyline(g, V, [[-Lh, -Wh], [Lh, -Wh], [Lh, Wh], [-Lh, Wh], [-Lh, -Wh]]); segW(g, V, [0, -Wh], [0, Wh]); polyline(g, V, arcPts(0, 0, Sz.boxW * 0.42, 0, Math.PI * 2, 40));
    for(const s of [-1, 1]){ const x0 = s * Lh, x1 = s * (Lh - Sz.boxL); polyline(g, V, [[x0, -Sz.boxW], [x1, -Sz.boxW], [x1, Sz.boxW], [x0, Sz.boxW]]); polyline(g, V, [[x0, -Sz.goalW - 1.5], [s * (Lh - 2.2), -Sz.goalW - 1.5], [s * (Lh - 2.2), Sz.goalW + 1.5], [x0, Sz.goalW + 1.5]]);
      polyline(g, V, arcPts(s * (Lh - Sz.spot), 0, Sz.boxW * 0.32, s > 0 ? Math.PI * 0.68 : -Math.PI * 0.32, s > 0 ? Math.PI * 1.32 : Math.PI * 0.32, 14)); }
    for(const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) polyline(g, V, arcPts(sx * Lh, sy * Wh, 0.9, Math.atan2(-sy, 0), Math.atan2(0, -sx), 6));
    g.stroke(); };
  g.lineCap = 'round';
  if(Lk.glow){ g.strokeStyle = Lk.line; g.globalAlpha = 0.25; g.lineWidth = lw * 4; lines(); g.globalAlpha = 1; }
  g.strokeStyle = night ? 'rgba(255,255,255,0.92)' : Lk.line; g.lineWidth = lw; lines();
  if(CAGE) drawFence(g, V, Sz, Lk, night, 'far');
  (FUT ? [[0, 0], [-(Lh - Sz.spot), 0], [Lh - Sz.spot, 0], [-(Lh - 10), 0], [Lh - 10, 0]] : CAGE ? [[0, 0]] : [[0, 0], [-(Lh - Sz.spot), 0], [Lh - Sz.spot, 0]]).forEach(([x, y]) => { const e = gEll(V, x, y, 0.18); if(e){ g.fillStyle = Lk.line; g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, 7); g.fill(); } });
}
// 🏟️ futsal: halfway line, 3 m circle, the D-shaped 6 m area round each goal · 🏙️ cage: halfway line + a small circle + a little box
function courtLines(g, V, Sz){
  const Lh = Sz.Lh, Wh = Sz.Wh;
  polyline(g, V, [[-Lh, -Wh], [Lh, -Wh], [Lh, Wh], [-Lh, Wh], [-Lh, -Wh]]); segW(g, V, [0, -Wh], [0, Wh]);
  if(Sz.court === 'cage'){ polyline(g, V, arcPts(0, 0, 1.6, 0, Math.PI * 2, 28)); for(const s of [-1, 1]){ const x0 = s * Lh, x1 = s * (Lh - Sz.boxL); polyline(g, V, [[x0, -Sz.boxW], [x1, -Sz.boxW], [x1, Sz.boxW], [x0, Sz.boxW]]); } return; }
  polyline(g, V, arcPts(0, 0, 3, 0, Math.PI * 2, 36));
  for(const s of [-1, 1]){ const x0 = s * Lh, r = Sz.boxL, gw = Sz.goalW;   // goalW = half the goal mouth: a 6 m quarter circle round each post
    const a = arcPts(x0, -gw, r, s > 0 ? Math.PI : 0, s > 0 ? Math.PI * 1.5 : -Math.PI * 0.5, 12), b = arcPts(x0, gw, r, Math.PI * 0.5, s > 0 ? Math.PI : 0, 12);
    polyline(g, V, a.reverse().concat(b.reverse())); }
  for(const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) polyline(g, V, arcPts(sx * Lh, sy * Wh, 0.25, Math.atan2(-sy, 0), Math.atan2(0, -sx), 4));
}
// 🏙️ the street cage: posts + wire fence (far half first, the near half after the players, see-through)
function drawFence(g, V, Sz, Lk, night, half){
  const Lh = Sz.Lh + 0.15, Wh = Sz.Wh + 0.15, H = 3, col = night ? shadeHex(Lk.fence, -0.3) : Lk.fence, cam = V.eye;
  const sides = [[[-Lh, -Wh], [Lh, -Wh]], [[Lh, -Wh], [Lh, Wh]], [[Lh, Wh], [-Lh, Wh]], [[-Lh, Wh], [-Lh, -Wh]]];
  sides.forEach(([a, b]) => {
    const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2, far = (mx - cam[0]) * mx + (my - cam[1]) * my > 0;   // the camera looks at it from inside
    if((half === 'far') !== far) return;
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]), n = Math.max(2, Math.round(len / 1.2));
    fillPoly(g, V, [[a[0], a[1], 0], [b[0], b[1], 0], [b[0], b[1], 0.5], [a[0], a[1], 0.5]], half === 'far' ? shadeHex(col, -0.45) : 'rgba(40,44,56,0.55)');   // kick board
    g.strokeStyle = col; g.globalAlpha = half === 'far' ? 0.5 : 0.22; g.lineWidth = 1; g.beginPath();
    for(let i = 0; i <= n; i++){ const t = i / n, x = a[0] + (b[0] - a[0]) * t, y = a[1] + (b[1] - a[1]) * t; segW(g, V, [x, y, 0.5], [x, y, H]); }
    for(let j = 1; j <= 4; j++){ const z = 0.5 + (H - 0.5) * j / 4; segW(g, V, [a[0], a[1], z], [b[0], b[1], z]); }
    g.stroke(); g.globalAlpha = 1;
    g.strokeStyle = shadeHex(col, -0.2); g.lineWidth = Math.max(1.5, V.sc(mx, my, 1.5) * 0.08); g.beginPath();
    for(let i = 0; i <= n; i += 2){ const t = i / n; segW(g, V, [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, 0], [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, H]); }
    segW(g, V, [a[0], a[1], H], [b[0], b[1], H]); g.stroke();
  });
}
function shadeHex(h, k){ const n = parseInt(h.slice(1), 16), f = c => Math.max(0, Math.min(255, Math.round(c + (k < 0 ? c * k : (255 - c) * k)))); return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(c => f(c).toString(16).padStart(2, '0')).join(''); }
function crowd(g, V, Lk, Sz, t, night){
  const Lh = Sz.Lh + 6, ey = Sz.Wh + 5, cols = Lk.crowd, emoList = Lk.crowdEmo;
  for(const side of [-1, 1]) for(let r = 0; r < 5; r++){
    const y = side * (ey + 1.4 + r * 2.2), z0 = 0.95 + r * 1.45;
    for(let x = -Lh, i = 0; x <= Lh; x += Sz.Lh > 40 ? 2 : 1.25, i++){
      const wave = Math.max(0, Math.sin(t * 2.6 - x * 0.22 - (side > 0 ? 0 : 2))) * 0.55, c = V.P(x, y, z0 + wave); if(!c) continue;
      const s = V.sc(x, y, z0); if(s < 1.2) continue;
      const h = (i * 7 + r * 13 + (side > 0 ? 5 : 0)) % 17;
      if(emoList && h === 3 && s > 4){ emo(g, emoList[(i + r) % emoList.length], c[0], c[1] - s * 0.3, s * 1.4, 1); continue; }
      g.fillStyle = cols[h % cols.length]; g.fillRect(c[0] - s * 0.32, c[1] - s * 0.55, s * 0.64, s * 0.62);
      g.fillStyle = night ? '#C9A27A' : '#F2C29B'; g.fillRect(c[0] - s * 0.2, c[1] - s * 0.9, s * 0.4, s * 0.36);
    }
  }
  // the stands behind the goals
  const ex = Sz.Lh + 7, Wy = Sz.Wh + 4;
  for(const side of [-1, 1]) for(let r = 0; r < 5; r++){
    const x = side * (ex + 1.4 + r * 2.2), z0 = 0.95 + r * 1.45;
    for(let y = -Wy, i = 0; y <= Wy; y += Sz.Lh > 40 ? 2 : 1.25, i++){
      const wave = Math.max(0, Math.sin(t * 2.6 - y * 0.22 + (side > 0 ? 1 : 3))) * 0.55, c = V.P(x, y, z0 + wave); if(!c) continue;
      const s = V.sc(x, y, z0); if(s < 1.2) continue;
      const h = (i * 11 + r * 7 + (side > 0 ? 3 : 0)) % 17;
      if(emoList && h === 5 && s > 4){ emo(g, emoList[(i + r) % emoList.length], c[0], c[1] - s * 0.3, s * 1.4, 1); continue; }
      g.fillStyle = cols[h % cols.length]; g.fillRect(c[0] - s * 0.32, c[1] - s * 0.55, s * 0.64, s * 0.62);
      g.fillStyle = night ? '#C9A27A' : '#F2C29B'; g.fillRect(c[0] - s * 0.2, c[1] - s * 0.9, s * 0.4, s * 0.36);
    }
  }
}
function drawGoal(g, V, Sz, s, Lk){
  const x = s * Sz.Lh, xb = s * (Sz.Lh + (Sz.cage ? 0.6 : Sz.court ? 1.0 : 1.25)), w = Sz.goalW, h = Sz.goalH;
  g.strokeStyle = 'rgba(255,255,255,0.45)'; g.lineWidth = Math.max(0.6, V.sc(x, 0, 1) * 0.03); g.beginPath();
  for(let i = 0; i <= 10; i++){ const y = -w + 2 * w * i / 10; segW(g, V, [x, y, h], [xb, y, h * 0.75]); segW(g, V, [xb, y, h * 0.75], [xb, y, 0]); }
  for(let j = 1; j <= 4; j++){ const z = h * 0.75 * j / 5; segW(g, V, [xb, -w, z], [xb, w, z]); }
  for(const sy of [-1, 1]) for(let j = 0; j <= 3; j++){ const z = h * j / 4; segW(g, V, [x, sy * w, z], [xb, sy * w, z * 0.75]); }
  g.stroke();
  g.strokeStyle = Lk.goalCol || '#FFFFFF'; g.lineWidth = Math.max(2, V.sc(x, 0, 1) * 0.12); g.lineCap = 'round'; g.beginPath();
  segW(g, V, [x, -w, 0], [x, -w, h]); segW(g, V, [x, w, 0], [x, w, h]); segW(g, V, [x, -w, h], [x, w, h]); g.stroke();
}
function drawFlag(g, V, x, y, t){ const a = V.P(x, y, 0), b = V.P(x, y, 1.5); if(!a || !b) return; g.strokeStyle = '#FFFFFF'; g.lineWidth = Math.max(1, V.sc(x, y, 1) * 0.06); g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); const s = V.sc(x, y, 1.5) * 0.5, wv = Math.sin(t * 5 + x) * s * 0.2; g.fillStyle = '#FF5A1F'; g.beginPath(); g.moveTo(b[0], b[1]); g.lineTo(b[0] + s * (x > 0 ? -1 : 1), b[1] + s * 0.3 + wv); g.lineTo(b[0], b[1] + s * 0.6); g.fill(); }
function drawSoccerBall(g, x, y, r, spin){
  g.save(); g.translate(x, y); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, r, 0, 7); g.fill(); g.clip();
  g.rotate(spin || 0); g.fillStyle = '#1B1F2E';
  const pent = (cx, cy, rr) => { g.beginPath(); for(let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * Math.PI * 2 / 5; g[i ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } g.closePath(); g.fill(); };
  pent(0, 0, r * 0.36); for(let i = 0; i < 5; i++){ const a = -Math.PI / 2 + i * Math.PI * 2 / 5 + Math.PI / 5; pent(Math.cos(a) * r * 0.95, Math.sin(a) * r * 0.95, r * 0.3); }
  g.restore(); g.strokeStyle = 'rgba(0,0,0,0.35)'; g.lineWidth = Math.max(0.8, r * 0.08); g.beginPath(); g.arc(x, y, r, 0, 7); g.stroke();
  const hl = g.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x - r * 0.35, y - r * 0.4, r); hl.addColorStop(0, 'rgba(255,255,255,0.5)'); hl.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = hl; g.beginPath(); g.arc(x, y, r, 0, 7); g.fill();
}
function drawLookPreview(c, k){
  if(!c) return; const g = c.getContext('2d'), Sz = BO.SIZES[SET.size || 4], W = c.width, H = c.height;
  const Vp = makeView(W, H, {l: 0, r: 0, t: 0, b: 0}, [-Sz.Lh * 0.15 - 12, 0, 11], [Sz.Lh * 0.3, 0, 0], 'behind');
  g.save(); drawWorld(g, Vp, LOOKS[k], Sz, 1.2, k === 'classic' && SET.night); drawGoal(g, Vp, Sz, 1, LOOKS[k]); const b = Vp.P(Sz.Lh * 0.1, 0, 0.2); if(b) drawSoccerBall(g, b[0], b[1], Math.max(3, Vp.sc(0, 0, 0) * 0.3), 0.4); g.restore();
}
/* 🧑 avatars: each player's looks are drawn ONCE into small pictures (stand · 4 run steps · kick · air · lying), then copied each frame (fast with 14 players) */
const SPR_W = 150, SPR_H = 160, SPR_FX = 75, SPR_FY = 140;
/* 🎬 bo-5a real actions: the engine's beat (p.act · p.bi · p.bq) → the pose of 🎭 BLOCK blasoff (AvatarActing) at that moment.
   One timeline per act (the engine is the clock, the timeline only gives the pose); pictures cached per (player, act, beat, ¼ step), ≤ 600, oldest out. */
const ACT_RUN = {}, SPR_LRU = [], SPR_CAP = 600, GK_POSE = {gkr0: 'bo.gk-ready', gkr1: 'bo.gk-shuffle', prep: 'bo.trap-open', shield: 'bo.shield', touch: 'bo.dribble-touch', hsnap: 'bo.head-snap', tload: 'bo.trick-load', gkhold: 'bo.gk-hold', tihold: 'bo.ti-hold'};   /* still poses (bo-5a/b) */
function actRun(key){
  if(ACT_RUN[key] !== undefined) return ACT_RUN[key]; let r = null;
  try{ if(window.Acting && Acting.act && Acting.act('blasoff.' + key)) r = Acting.play({name: ''}, 'blasoff.' + key, {t0: 0}); }catch(e){ r = null; }
  return (ACT_RUN[key] = r);
}
function actFrame(p, o){   // → {key, f} or null (no Acting / unknown act) · o = {act, bi, bq} to draw a beat the engine isn't playing (⚽ the back-lift while J / K is held)
  const act = o ? o.act : p.act, R = act && actRun(act); if(!R) return null;
  const i = Math.min(o ? o.bi : (p.bi || 0), R.beats.length - 1), q = Math.round(Math.max(0, Math.min(1, o ? o.bq : (p.bq || 0))) * 4) / 4, key = 'A:' + act + ':' + i + ':' + q;
  if(G.spr[p.i][key]) return {key};
  return {key, f: R.at((R.start[i] + R.D[i].ms * q) / 1000)};
}
const FAR_PX = 34;   // a player drawn shorter than this uses the short picture set (stand · run · kick · air · lie)
function farKey(p){ if(p.st === 'slide' || p.st === 'down') return 'lie'; const air = p.z > 0.05; if(p.act === 'gkdive') return p.bi >= 2 && p.bi <= 3 ? 'lie' : 'stand'; return air ? 'air' : p.gk && p.act ? 'gkr0' : 'stand'; }
function sprite(i, key, fr){
  const box = G.spr[i]; if(box[key]) return box[key];
  const Q = G.sq, c = document.createElement('canvas'); c.width = Math.round(SPR_W * Q); c.height = Math.round(SPR_H * Q); const g = c.getContext('2d'); g.scale(Q, Q);
  const p = G.M.players[i], a = {name: p.name, av: G.avs[i], dir: 1, walkT: 0}, o = {t: 0, still: true};
  if(key.indexOf('run') === 0) a.walkT = 0.01 + (+key.slice(3)) * (Math.PI * 2 / 11) / 4;
  else if(key === 'kick') o.pose = {legR: -1.05, legL: 0.25, armL: 0.9, armR: -0.5};
  else if(key === 'air') a.jumpH = 0.01;
  else if(key === 'lie') a.stance = 'lie';
  let done = false;
  if((fr || GK_POSE[key]) && window.Acting){ try{ Acting.draw(g, {name: p.name, av: G.avs[i]}, SPR_FX, SPR_FY, 1, fr || {pose: Acting.pose(GK_POSE[key]) || {}, face: 'focused'}, {t: 0, dir: 1}); done = true; }catch(e){ done = false; } }
  if(!done) try{ drawAvatar(g, a, SPR_FX, SPR_FY, 1, o); }catch(e){}
  if(key.charCodeAt(0) === 65 && key[1] === ':'){ SPR_LRU.push([i, key]); while(SPR_LRU.length > SPR_CAP){ const [j, kk] = SPR_LRU.shift(); if(G.spr[j]) delete G.spr[j][kk]; } }
  if(p.gk){ g.fillStyle = '#FFFFFF'; g.strokeStyle = '#222'; g.lineWidth = 1.5; }
  box[key] = c; return c;
}
function holdBeat(p){   // ⚽ bo-5b: holding J / K with the ball = the anticipation, the back-lift grows with the power
  const M = G.M; if(p.act || p.ctrl < 0 || M.ball.owner !== p.i || M.phase !== 'play') return null; const c = M.ctrls.find(x => x.pi === p.i); if(!c) return null;
  const at = c.kAt >= 0 ? c.kAt : c.jAt >= 0 ? c.jAt : -1; if(at < 0) return null;
  return {act: c.kAt >= 0 ? (c.star >= 1 ? 'blast' : 'shot') : 'pass', bi: 1, bq: Math.min(1, (M.t - at) / 0.75)};
}
function playerKey(p){
  if(p.st === 'slide' || (p.st === 'down' && !p.act) || p.st === 'dive') return 'lie';
  const M = G.M, b = M.ball, sp = Math.hypot(p.vx, p.vy);
  if(p.gk && b.owner === p.i && b.held) return 'gkhold';   /* 🧤 bo-5d: the ball held at the chest */
  if(M.phase === 'restart' && M.rs && M.rs.kind === 'throw' && M.rs.taker === p.i && Math.hypot(p.x - M.rs.x, p.y - M.rs.y) < 1.4) return 'tihold';   /* 🙌 the ball behind the head, both hands */
  if(p.z > 0.05 && M.t - (p.hitT || -9) < 0.16) return 'hsnap';   /* 🗣️ the head snaps forward at the touch */
  if(!p.gk && p.st === 'ok' && p.z <= 0.05){
    if(b.owner < 0 && b.passTo === p.i){ const d = Math.hypot(b.x - p.x, b.y - p.y), bv = Math.hypot(b.vx, b.vy); if(bv > 1 && d / bv < 0.45) return 'prep'; }   /* 🫳 open up for the first touch */
    if(b.owner === p.i && p.ctrl >= 0 && (M.ctrls.find(x => x.pi === p.i) || {}).trickPend >= 0) return 'tload';   /* 🕺 the trick's wind-up while L is held for its 0.14 s chord wait */
    if(b.owner === p.i){ if(sp < 3.5 && M.players.some(o => o.side !== p.side && !o.gk && Math.hypot(o.x - p.x, o.y - p.y) < 1.6)) return 'shield';   /* 🛡️ side-on, arm out */
      if(sp > 1.5){ const f = Math.floor(p.run * 1.7); if(f % 8 === 0) return 'touch'; } }   /* ⚽ a little touch every few steps */
  }
  if(p.gk && p.st === 'ok' && p.z <= 0.05 && !p.celebrate && G.M.ball.x * BO.dirOf(p.side, G.M) < 0) return Math.hypot(p.vx, p.vy) > 0.6 ? 'gkr' + (Math.floor(p.run * 1.7) % 2) : 'gkr0';   /* 🧤 ready stance while the ball is in his half */
  if(p.z > 0.05 || p.celebrate > 0) return 'air';
  if(p.kickT > 0.12) return 'kick';
  return Math.hypot(p.vx, p.vy) > 0.6 ? 'run' + (Math.floor(p.run * 1.7) % 4) : 'stand';
}
function diveOfs(p){   // 🧤 bo-5a: the keeper's body flies toward the dive spot (looks only — the game keeps his place, so the balance stays)
  if(p.act === 'gkdive' && p.diveY != null && p.bi >= 2){ const pr = p.bi === 2 ? p.bq * 0.3 : p.bi === 3 ? 0.3 + 0.7 * p.bq : 1; p.vo = (p.diveY - p.y) * pr; }
  else if(p.vo){ p.vo *= G.M.ball.owner === p.i ? 0.6 : 0.86; if(Math.abs(p.vo) < 0.01) p.vo = 0; }
  return p.vo || 0;
}
function drawPlayer(g, p, t){
  const py = p.y + (p.gk ? diveOfs(p) : 0), f = V.P(p.x, py, 0); if(!f) return; const s = V.sc(p.x, p.y, 0), k = s * 1.75 / 74; if(k < 0.05) return;
  const q = V.P(p.x + p.fx, p.y + p.fy, 0), dir = q && q[0] < f[0] - 0.5 ? -1 : 1;
  const ring = gEll(V, p.x, py, 0.55), c = p.ctrl >= 0 ? G.M.ctrls[p.ctrl] : null;
  if(ring){ g.lineWidth = Math.max(1.5, s * (c ? 0.09 : 0.05)); g.strokeStyle = c ? SEAT_COL[c.seat % 2] : TEAM_COL[p.side]; g.globalAlpha = c ? 0.95 : 0.7; g.beginPath(); g.ellipse(ring[0], ring[1], ring[2], ring[3], 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
  const far = s * 1.75 < FAR_PX, HB = !far && !p.act ? holdBeat(p) : null, A = HB ? actFrame(p, HB) : p.act && !far ? actFrame(p) : null;
  const key = A ? A.key : p.act && far ? farKey(p) : playerKey(p), img = sprite(p.i, key, A && A.f), lift = (p.z + (p.celebrate > 0 && !(p.act && p.act.slice(0, 3) === 'cel') ? Math.abs(Math.sin(t * 9)) * 0.35 : 0)) * s;
  const tilt = p.act === 'gkdive' ? (p.bi === 2 ? p.bq : p.bi === 3 ? 1 : p.bi === 4 ? 1 - p.bq : 0) : p.st === 'dive' ? 1 : 0;
  const dh = p.act === 'dheader' ? (p.bi === 2 ? p.bq : p.bi === 3 ? 1 : p.bi === 4 ? 1 - p.bq : 0) : 0;   /* 🗣️ diving header: the body goes flat, head first */
  g.save(); g.translate(f[0], f[1] - lift);
  if(tilt) g.rotate((p.dive || 1) * dir * 0.9 * tilt);
  if(dh){ const hc = s * 0.5; g.translate(0, -hc); g.rotate(dir * 1.25 * dh); g.translate(0, hc); }
  if(p.flip > 0){ const hc = s * 0.95; g.translate(0, -hc); g.rotate(-dir * Math.PI * 2 * (p.flipDir || 1) * (1 - p.flip / (p.flipD || 0.62))); g.translate(0, hc); }   // 🌀 flip volley: one full spin in the air · 🚲 bicycle: half a spin backwards (bo-5b)
  const turn = p.act === 'roulette' && p.bi === 3 ? Math.cos(Math.PI * 2 * p.bq) : 1, tw = Math.sign(turn || 1) * Math.max(0.18, Math.abs(turn));   /* 🌀 roulette: a real full turn (the picture turns round and back) */
  g.scale(dir * tw * k / G.sq, k / G.sq); g.drawImage(img, -SPR_FX * G.sq, -SPR_FY * G.sq); g.restore();
  if(G.captain && p.side === 0 && p.name === G.captain){ const ax = f[0] - s * 0.3, ay = f[1] - s * 1.3 - lift, r = Math.max(4, s * 0.16); g.fillStyle = '#FFD23F'; g.strokeStyle = '#7A4A00'; g.lineWidth = Math.max(1, r * 0.25); g.beginPath(); g.arc(ax, ay, r, 0, 7); g.fill(); g.stroke(); g.fillStyle = '#7A4A00'; g.font = '800 ' + Math.round(r * 1.3) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('C', ax, ay + r * 0.05); }   // 👑 R4a: the captain's armband
  if(p.cards && G.M.L.cards){ g.fillStyle = '#FFD23F'; g.fillRect(f[0] + s * 0.35, f[1] - s * 1.9 - lift, s * 0.18, s * 0.26); }
  if(c){   // name + a triangle over the person you steer
    const top = f[1] - s * 2.35 - lift, fs = Math.max(10, Math.min(15, s * 0.42)); g.font = '700 ' + fs + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.textBaseline = 'bottom';
    const nm = c.name, w = g.measureText(nm).width + 10; g.fillStyle = 'rgba(8,16,40,0.78)'; g.fillRect(f[0] - w / 2, top - fs - 6, w, fs + 4); g.fillStyle = SEAT_COL[c.seat % 2]; g.fillText(nm, f[0], top - 3);
    g.beginPath(); g.moveTo(f[0] - fs * 0.4, top); g.lineTo(f[0] + fs * 0.4, top); g.lineTo(f[0], top + fs * 0.45); g.fill();
    if(G.M.L.stamina && p.stamina < 0.98){ g.fillStyle = 'rgba(0,0,0,0.5)'; g.fillRect(f[0] - s * 0.5, f[1] + s * 0.32, s, s * 0.1); g.fillStyle = p.stamina < 0.25 ? '#FF5A1F' : '#7CF7A0'; g.fillRect(f[0] - s * 0.5, f[1] + s * 0.32, s * p.stamina, s * 0.1); }
  }
}
function ballLook(){   // 🙌 / 🧤 bo-5d: where the ball LOOKS to be (the game's ball is unchanged): over the thrower's head, dropping for a punt
  const M = G.M, b = M.ball, rs = M.rs;
  if(M.phase === 'restart' && rs && rs.kind === 'throw' && b.owner < 0){ const p = M.players[rs.taker]; if(p && Math.hypot(p.x - rs.x, p.y - rs.y) < 1.4) return Object.assign({}, b, {x: p.x + p.fx * 0.05, y: p.y + p.fy * 0.05, z: 2.05}); }
  const p = b.last >= 0 ? M.players[b.last] : null;
  if(p && p.act === 'throwin' && p.bi >= 2 && M.t - (b.passT || -9) < 0.4){ const u = (M.t - b.passT) / 0.4; return Object.assign({}, b, {z: b.z + 1.8 * (1 - u)}); }
  if(b.owner >= 0){ const o = M.players[b.owner]; if(o && o.act === 'gkpunt' && o.bi === 1) return Object.assign({}, b, {z: Math.max(0.15, b.z - 0.7 * o.bq)}); }
  return b;
}
function drawBall(g, t){
  const b = ballLook(), sh = gEll(V, b.x, b.y, 0.26); if(sh){ g.fillStyle = 'rgba(0,0,0,' + Math.max(0.08, 0.32 - b.z * 0.05).toFixed(3) + ')'; g.beginPath(); g.ellipse(sh[0], sh[1], sh[2] * Math.max(0.5, 1 - b.z * 0.08), sh[3] * Math.max(0.5, 1 - b.z * 0.08), 0, 0, 7); g.fill(); }
  const c = V.P(b.x, b.y, b.z + 0.24); if(!c) return; const r = Math.max(3, V.sc(b.x, b.y, b.z) * 0.27);
  if(b.shot && Math.hypot(b.vx, b.vy) > 12){ const c2 = V.P(b.x - b.vx * 0.05, b.y - b.vy * 0.05, b.z + 0.24 - b.vz * 0.05); if(c2){ g.strokeStyle = 'rgba(255,210,63,0.55)'; g.lineWidth = r * 1.4; g.lineCap = 'round'; g.beginPath(); g.moveTo(c2[0], c2[1]); g.lineTo(c[0], c[1]); g.stroke(); } }
  if(G.party && window.BombSkins){ if(G.M.phase === 'goal' && G.M.phaseT < 2.6) return; const gl = g.createRadialGradient(c[0], c[1], r * 0.3, c[0], c[1], r * 2.4); gl.addColorStop(0, 'rgba(255,79,163,' + (0.5 + 0.2 * Math.sin(t * 9)).toFixed(2) + ')'); gl.addColorStop(1, 'rgba(255,79,163,0)'); g.fillStyle = gl; g.beginPath(); g.arc(c[0], c[1], r * 2.4, 0, 7); g.fill();
    g.save(); g.translate(c[0], c[1]); g.rotate(Math.sin((b.roll || 0) * 0.35) * 0.5); BombSkins.draw(g, G.party, 0, 0, r * 3.2, t, Math.min(1, Math.hypot(b.vx, b.vy) / 25)); g.restore(); return; }
  if(G.ball >= 0) BallSkins.draw(g, G.ball, c[0], c[1], r, t); else drawSoccerBall(g, c[0], c[1], r, (b.roll || 0));
  if(G.M.twist === 'underwater' && b.z > 0.3){ g.fillStyle = 'rgba(255,255,255,0.55)'; for(let i = 1; i <= 4; i++){ const q = V.P(b.x - b.vx * 0.04 * i, b.y - b.vy * 0.04 * i, b.z + 0.24 - b.vz * 0.04 * i); if(q){ g.beginPath(); g.arc(q[0] + Math.sin(t * 9 + i) * 3, q[1], Math.max(1.5, r * (0.5 - i * 0.08)), 0, 7); g.fill(); } } }
}
/* 🎪 bo-3c: draw the pitch twist (mud + egg · current arrows · power zone · conveyor belts · wind arrow) */
function drawWind(g){   // 💨 Olympus: a badge in the top corner — the arrow points where the gust blows (as the camera sees it)
  const M = G.M, T = M.tw; if(M.twist !== 'olympus' || !T.wind) return; const b = M.ball, a = V.P(b.x, b.y, 0), c = V.P(b.x + T.wind.x, b.y + T.wind.y, 0); if(!a || !c) return;
  const ang = Math.atan2(c[1] - a[1], c[0] - a[0]), R = 30, cx = V.W - G.box.r - R - 12, cy = G.box.t + R + 12;
  g.save(); g.fillStyle = 'rgba(19,37,74,0.78)'; g.strokeStyle = '#FFD23F'; g.lineWidth = 3; g.beginPath(); g.arc(cx, cy, R, 0, 7); g.fill(); g.stroke();
  g.translate(cx, cy); g.rotate(ang); g.strokeStyle = '#fff'; g.fillStyle = '#fff'; g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(-R * 0.6, 0); g.lineTo(R * 0.25, 0); g.stroke(); g.beginPath(); g.moveTo(R * 0.65, 0); g.lineTo(R * 0.1, -R * 0.35); g.lineTo(R * 0.1, R * 0.35); g.fill(); g.restore();
  emo(g, '💨', cx - R - 16, cy, 24, 0.95);
}
function drawTwist(g, t){
  const M = G.M, T = M.tw, S = G.Sz; if(!M.twist) return;
  if(M.twist === 'jungle'){ (T.mud || []).forEach(m => { const e = gEll(V, m.x, m.y, m.r); if(!e) return; g.fillStyle = 'rgba(92,58,24,0.62)'; g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3] / 1.4, 0, 0, 7); g.fill(); g.fillStyle = 'rgba(140,96,50,0.5)'; g.beginPath(); g.ellipse(e[0] - e[2] * 0.2, e[1] - e[3] * 0.12, e[2] * 0.45, e[3] * 0.25, 0, 0, 7); g.fill(); });
    const eg = T.egg; if(eg){ const f = V.P(eg.x, eg.y, 0.4); if(f){ g.save(); g.translate(f[0], f[1]); g.rotate(eg.rot); emo(g, '🥚', 0, 0, Math.max(16, V.sc(eg.x, eg.y, 0) * 1.1), 1); g.restore(); } } }
  if(M.twist === 'underwater'){ g.strokeStyle = 'rgba(180,240,255,0.45)'; g.lineWidth = 3; g.lineCap = 'round'; const off = (t * 1.2) % 1;
    for(let i = -2; i <= 2; i++) for(let j = -1; j <= 1; j++){ const x = i * S.Lh * 0.38, y = (j + off * T.cur) * S.Wh * 0.5, a = 0.9, p0 = V.P(x - a, y - T.cur * a, 0), p1 = V.P(x, y, 0), p2 = V.P(x + a, y - T.cur * a, 0); if(!p0 || !p1 || !p2) continue; g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.lineTo(p2[0], p2[1]); g.stroke(); } }
  if(M.twist === 'neon' && T.zone){ const z = T.zone, e = gEll(V, z.x, z.y, z.r); if(e){ const k = 0.45 + 0.35 * Math.sin(t * 8); g.fillStyle = 'rgba(255,46,196,' + (k * 0.45).toFixed(2) + ')'; g.strokeStyle = 'rgba(255,230,80,' + (0.5 + k * 0.5).toFixed(2) + ')'; g.lineWidth = 3; g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3] / 1.4, 0, 0, 7); g.fill(); g.stroke(); emo(g, '⚡', e[0], e[1], Math.max(14, V.sc(z.x, z.y, 0) * 0.9), 0.9); } }
  if(M.twist === 'robot'){ for(const sd of [-1, 1]){ const y0 = sd * T.beltY, y1 = sd * S.Wh; fillPoly(g, V, [[-S.Lh, y0, 0], [S.Lh, y0, 0], [S.Lh, y1, 0], [-S.Lh, y1, 0]], 'rgba(30,36,48,0.55)');
      g.strokeStyle = 'rgba(92,200,255,0.75)'; g.lineWidth = 2; const ph = ((t * T.belt * sd) % 2 + 2) % 2; for(let x = -S.Lh + ph; x < S.Lh; x += 2){ const a = V.P(x, y0, 0), b = V.P(x + sd * 0.7, (y0 + y1) / 2, 0), c = V.P(x, y1, 0); if(a && b && c){ g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.stroke(); } } } }
}
function drawGuides(g, t){
  // 🌱 Basic: an arrow from you to the goal + a glowing ring under the best pass · 🐣 Junior: the ring for the first passes
  const M = G.M; if(!G.help) return;
  M.ctrls.forEach(c => { const p = M.players[c.pi]; if(!p) return; const h = BO.hint(M, c.ci); if(!h) return;
    if(h.pass >= 0 && (G.help >= 2 || c.passes < 3)){ const q = M.players[h.pass], e = gEll(V, q.x, q.y, 0.9 + Math.sin(t * 6) * 0.12); if(e){ g.strokeStyle = '#FFD23F'; g.lineWidth = Math.max(2, V.sc(q.x, q.y, 0) * 0.12); g.globalAlpha = 0.85; g.beginPath(); g.ellipse(e[0], e[1], e[2], e[3], 0, 0, 7); g.stroke(); g.globalAlpha = 1;
      const top = V.P(q.x, q.y, 2.4); if(top) emo(g, '⚽', top[0], top[1] - Math.abs(Math.sin(t * 5)) * 8, Math.max(14, V.sc(q.x, q.y, 2) * 0.6), 1); } }
    if(G.help >= 2){ const gx = h.goal.x, dx = gx - p.x, dy = -p.y, dm = Math.hypot(dx, dy) || 1, L = Math.min(dm - 2, 6 + Math.sin(t * 4)), ax = p.x + dx / dm * 1.2, ay = p.y + dy / dm * 1.2, bx = p.x + dx / dm * L, by = p.y + dy / dm * L;
      if(L > 1.5){ g.strokeStyle = h.shoot ? 'rgba(255,90,31,0.9)' : 'rgba(255,255,255,0.75)'; g.lineWidth = Math.max(2, V.sc(p.x, p.y, 0) * 0.16); g.beginPath(); segW(g, V, [ax, ay], [bx, by]); const nx = -dy / dm, ny = dx / dm; segW(g, V, [bx, by], [bx - dx / dm * 1 + nx * 0.7, by - dy / dm * 1 + ny * 0.7]); segW(g, V, [bx, by], [bx - dx / dm * 1 - nx * 0.7, by - dy / dm * 1 - ny * 0.7]); g.stroke(); } }
  });
}
// 🎤 the Tricks Battle stage: graffiti wall + street floor, 🎧 DJ, the two dancers, the beat ring, 3 judges with score cards
const JUDGE_SPR = {};
function judgeSprite(name){ if(JUDGE_SPR[name]) return JUDGE_SPR[name]; const c = document.createElement('canvas'); c.width = SPR_W; c.height = SPR_H; const g = c.getContext('2d'); try{ drawAvatar(g, {name, av: name.indexOf('Robo') === 0 ? defaultAvatar(name) : myAvatar(name), dir: 1, walkT: 0}, SPR_FX, SPR_FY, 1, {t: 0, still: true}); }catch(e){} return (JUDGE_SPR[name] = c); }
function judgesOf(){ if(G.judges) return G.judges; const fam = others().filter(n => n !== 'Guest' && !G.humans.some(h => h.name === n)); return (G.judges = fam.concat(['Robo Judge', 'Robo DJ', 'Robo Ref']).slice(0, 3)); }
function battlePads(){ G.btn.forEach(B => { B.mode = ''; }); }
function ballAt(trick, u, fx, fy, s){   // where the ball is during a trick (u = 0…1) — screen offsets from the dancer's feet, s = body size
  if(trick === 'rainbow') return [fx + (-0.5 + u) * s * 0.9, fy - Math.sin(u * Math.PI) * s * 2.3];
  if(trick === 'atw') return [fx + Math.cos(u * Math.PI * 2) * s * 0.45, fy - s * 0.25 - Math.sin(u * Math.PI * 2) * s * 0.18];
  if(trick === 'knee') return [fx + s * 0.15, fy - Math.sin(u * Math.PI) * s * 0.95];
  if(trick === 'neck') return [fx, fy - s * (u < 0.3 ? u / 0.3 * 1.7 : 1.7)];
  if(trick === 'stepover' || trick === 'spinover' || trick === 'sitover') return [fx + Math.sin(u * Math.PI * 2) * s * 0.3, fy];
  // 🎮 bo-5c-3 combos: the ball follows the ball half of the combo, lifted / lowered with the body
  const hop = Math.sin(u * Math.PI) * s * 0.6, up = (a, h) => [a[0], a[1] - h];
  if(trick === 'spinbow') return ballAt('rainbow', u, fx, fy, s);
  if(trick === 'skybow') return [fx + (-0.5 + u) * s * 0.9, fy - Math.sin(u * Math.PI) * s * 2.9];
  if(trick === 'spinatw') return ballAt('atw', (u * 2) % 1, fx, fy, s);   /* twice round */
  if(trick === 'hopatw') return up(ballAt('atw', u, fx, fy, s), hop);
  if(trick === 'lowatw') return [fx + Math.cos(u * Math.PI * 2) * s * 0.45, fy - s * 0.08 - Math.sin(u * Math.PI * 2) * s * 0.08];
  if(trick === 'spinknee' || trick === 'kneeslide') return ballAt('knee', u, fx, fy, s);
  if(trick === 'scissor') return up(ballAt('stepover', u, fx, fy, s), hop * 0.6);
  if(trick === 'kneehead') return [fx + s * 0.1 * (1 - u), fy - (u < 0.4 ? Math.sin(u / 0.4 * Math.PI / 2) * s * 0.95 : s * (0.95 + (u - 0.4) / 0.6 * 1.0))];
  if(trick === 'crown') return [fx, fy - s * (u < 0.35 ? u / 0.35 * 1.95 : 1.95)];
  if(trick === 'neckcatch') return u < 0.55 ? [fx + (-0.5 + u / 0.55 * 0.5) * s * 0.9, fy - Math.sin(u / 0.55 * Math.PI * 0.75) * s * 2.3] : [fx, fy - s * 1.7];
  if(trick === 'backroll') return [fx - s * 0.12 * u, fy - s * 1.6 * (1 - u)];   /* rolls down the back */
  if(trick === 'shoulder') return [fx + (0.3 - u * 0.6) * s * 0.5, fy - s * (u < 0.3 ? u / 0.3 * 1.45 : 1.45)];
  if(trick === 'solestop') return [fx + s * 0.25 * (1 - u * 0.4), fy];
  if(trick === 'hop') return [fx + s * 0.25, fy - hop];
  return [fx + s * 0.25, fy];
}
/* 🎤 bo-5c DANCE-OFF: the two dancers are drawn LIVE with Acting.draw (sharp on any screen, no picture cache) — groove on the beat,
   battle tricks as real moves (contact = the beat you hit), robot wind-up just before its beat, entrance, freeze on the turn's end,
   the waiting dancer reacts (😮 wow · 🤭 laugh · 🫴 bring it), 🏆 mic drop for the winner, 👏 clap for the other. */
const GROOVE = ['bo.groove-a', 'bo.groove-b', 'bo.groove-a', 'bo.toprock'], GROOVE_WAIT = ['bo.groove-wait', 'bo.groove-a'];
function btDur(tr){ const R = actRun('bt-' + tr); return R ? (R.start[R.start.length - 1] + R.D[R.D.length - 1].ms - R.start[2]) / 1000 : 0.45; }   /* contact → end of settle */
const isSpin = tr => tr === 'spin' || /^spin/.test(tr);   /* 🔄 the body turns all the way round during the follow-through */
function spinTurn(R, ms){ const u = Math.max(0, Math.min(1, (ms - R.start[2]) / (R.D[2].ms + R.D[3].ms))), c = Math.cos(Math.PI * 2 * (0.5 - 0.5 * Math.cos(Math.PI * u))); return Math.sign(c || 1) * Math.max(0.16, Math.abs(c)); }
const POSE_ONE = {sx: 1, sy: 1, headSc: 1};   /* scale keys rest at 1, not 0 (a missing sy squashed the robot flat) */
function lerpPose(a, b, u){ const o = {}; new Set(Object.keys(a).concat(Object.keys(b))).forEach(k => { if(typeof a[k] === 'number' || typeof b[k] === 'number'){ const d = POSE_ONE[k] != null ? POSE_ONE[k] : 0, x = typeof a[k] === 'number' ? a[k] : d, y = typeof b[k] === 'number' ? b[k] : d; o[k] = x + (y - x) * u; } }); return o; }   /* numbers only (a pose also carries labels) */
function danceFrame(sd, act, beatPh, B, M, t){
  if(!window.Acting || !Acting.pose) return null;
  const at = (name, ms) => { const R = actRun(name); if(!R) return null; const end = R.start[R.start.length - 1] + R.D[R.D.length - 1].ms; if(ms > end) return null; const f = R.at(Math.max(0, ms) / 1000); return f && f.pose ? f : null; }, rx = G.brx && G.brx[sd];   /* past its end / no pose → the groove */
  if(M.done){ const w = M.score[0] > M.score[1] ? 0 : 1, R = actRun(sd === w ? 'bt-win' : 'bt-clap'); if(R){ const tot = R.start[4] + R.D[4].ms, f = at(sd === w ? 'bt-win' : 'bt-clap', (t * 1000) % (tot + 400)); if(f) return f; } }
  const L = B.last && B.last.side === sd ? B.last : null;
  if(L && M.t - L.t < btDur(L.trick)){ const R = actRun('bt-' + L.trick); if(R){ const ms = R.start[2] + (M.t - L.t) * 1000, f = at('bt-' + L.trick, ms); if(f) return isSpin(L.trick) ? Object.assign({turn: spinTurn(R, ms)}, f) : f; } }   /* the trick: contact = the beat you hit */
  if(act && B.phase === 'turn' && B.cur){ const human = M.ctrls.some(c => c.side === sd), pk = !human && B.cur.nextPick && BO.BTRICK[B.cur.nextPick], tr = pk ? pk[0] : 'stepover', R = actRun('bt-' + tr);
    if(R){ const win = R.D[1].ms / 1000, left = human ? B.beat - (B.phaseT % B.beat) : B.cur.nextAt != null ? B.cur.nextAt - B.phaseT : -1;   /* 🤖 the wind-up of the trick it picked · 🧒 a load into every beat of your turn (anticipation) */
      if(left > 0 && left < win){ const f = at('bt-' + tr, R.start[1] + (1 - left / win) * R.D[1].ms); if(f) return f; } } }
  if(rx && M.t - rx.t < 0.8){ const f = at('bt-' + rx.a, (M.t - rx.t) * 1000); if(f) return f; }
  if(B.phase === 'intro' && B.turn === sd && B.phaseT < 1.0){ const f = at('bt-enter', B.phaseT * 1000); if(f) return f; }
  if(B.phase === 'cards' && B.turn === sd){ const P = Acting.pose('bo.freeze'); if(P) return {pose: Object.assign({}, P, {dy: (P.dy || 0) + Math.sin(t * 3) * 0.6}), face: 'proud'}; }
  const list = act ? GROOVE : GROOVE_WAIT, k = Math.floor((B.phase === 'turn' ? B.phaseT : t) / B.beat), u = 0.5 - 0.5 * Math.cos(beatPh * Math.PI);
  const A = Acting.pose(list[k % list.length]), Bq = Acting.pose(list[(k + 1) % list.length]); if(!A || !Bq) return null;
  const P = lerpPose(A, Bq, u); P.dy = (P.dy || 0) + (act ? 3 : 1.5) * Math.pow(1 - beatPh, 3);   /* a dip on every beat */
  return {pose: P, face: act ? (beatPh < 0.5 ? 'joy' : 'cheeky') : 'happy'};
}
function drawBattle(g, t, Lk){
  const M = G.M, B = M.battle, W = G.W, H = G.H, top = G.box ? G.box.t : 60, bot = H - (G.box ? G.box.b * 0.35 : 40);
  const beatPh = B.phase === 'turn' ? (B.phaseT / B.beat) % 1 : (t / B.beat) % 1, pulse = Math.pow(1 - beatPh, 3);
  const wall = g.createLinearGradient(0, top, 0, H * 0.62); wall.addColorStop(0, shadeHex(Lk.stand, -0.25)); wall.addColorStop(1, shadeHex(Lk.stand, 0.1)); g.fillStyle = wall; g.fillRect(0, 0, W, H * 0.62);
  g.fillStyle = shadeHex(Lk.cage[0], -0.1); g.fillRect(0, H * 0.62, W, H * 0.38);
  for(let i = 0; i < 9; i++){ g.globalAlpha = 0.18; g.fillStyle = ['#FF2EC4', '#3DDC97', '#FFD23F', '#5CC8FF'][i % 4]; g.beginPath(); g.ellipse(W * (0.05 + i * 0.12), H * (0.3 + (i % 3) * 0.08), 40 + (i % 3) * 18, 18 + (i % 2) * 10, i * 0.5, 0, 7); g.fill(); } g.globalAlpha = 1;   // graffiti blobs
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(W / 2, H * 0.75, W * 0.36, H * 0.09, 0, 0, 7); g.stroke();   // the battle circle
  const dj = Math.min(W, H) * 0.09; g.fillStyle = 'rgba(8,16,40,0.85)'; g.fillRect(W / 2 - dj * 1.8, top + 8, dj * 3.6, dj * 1.15); emo(g, '🎧', W / 2 - dj * 0.6, top + 8 + dj * 0.6, dj * 0.8, 1); emo(g, '🎛️', W / 2 + dj * 0.6, top + 8 + dj * 0.6, dj * 0.7, 1);
  [-1, 1].forEach(sd => emo(g, '🔊', W / 2 + sd * dj * 2.6, top + 8 + dj * 0.6, dj * (0.9 + pulse * 0.25), 1));
  g.font = '800 ' + Math.max(11, dj * 0.32) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#FFD23F'; g.fillText('🎵 ' + BO.BPM[M.level] + ' BPM · round ' + B.round + ' of 3', W / 2, top + 8 + dj * 1.45);
  const dancers = [0, 1].map(sd => M.players.find(p => p.side === sd && p.ctrl >= 0) || M.players.filter(p => p.side === sd && !p.gk).slice(-1)[0]);
  const s = Math.min(H * (phoneLand() ? 0.2 : 0.26), W * 0.16), fy = H * 0.76;   /* 📱 sideways phone: heads stay below the DJ booth */
  let lo = 0, hi = W; if(phoneLand()){ const bp = document.querySelector('#pads .btnpad'), dp = document.querySelector('#pads .bodypad'), sr = $('stage').getBoundingClientRect(); if(bp){ const r = bp.getBoundingClientRect(); if(r.width) hi = Math.min(W, r.left - sr.left - 8); } if(dp){ const r = dp.getBoundingClientRect(); if(r.width) lo = Math.max(0, r.right - sr.left + 4); } }   /* 📱 sideways phone: the dancers stand between the two thumbs' buttons (pz sizes) */
  dancers.forEach((p, sd) => { if(!p) return; const act = B.turn === sd && B.phase !== 'cards', fx = hi < W || lo > 0 ? lo + (hi - lo) * (sd ? 0.78 : 0.24) : W * (sd ? 0.68 : 0.32), k = s * 1.75 / 74 / 1.05;
    if(act){ const sp = g.createRadialGradient(fx, fy, 2, fx, fy, s * 1.4); sp.addColorStop(0, 'rgba(255,240,180,0.45)'); sp.addColorStop(1, 'rgba(255,240,180,0)'); g.fillStyle = sp; g.beginPath(); g.ellipse(fx, fy, s * 1.4, s * 0.45, 0, 0, 7); g.fill(); }
    if(act && B.phase === 'turn'){ const r0 = s * 0.42; g.strokeStyle = 'rgba(255,255,255,0.8)'; g.lineWidth = 3; g.beginPath(); g.ellipse(fx, fy, r0, r0 * 0.32, 0, 0, 7); g.stroke();   // 🎯 the target ring
      const rr = r0 * (1 + 1.6 * (1 - beatPh)); g.strokeStyle = beatPh > 0.85 || beatPh < 0.08 ? '#3DDC97' : '#FFD23F'; g.lineWidth = 3 + pulse * 5; g.globalAlpha = 0.35 + 0.65 * (1 - Math.abs(0.5 - beatPh) * 0.6); g.beginPath(); g.ellipse(fx, fy, rr, rr * 0.32, 0, 0, 7); g.stroke(); g.globalAlpha = 1; }
    const bounce = act ? Math.abs(Math.sin(beatPh * Math.PI)) * s * 0.06 : 0, key = p.kickT > 0.05 ? 'kick' : act ? (beatPh < 0.5 ? 'stand' : 'run1') : 'stand';
    g.save(); g.globalAlpha = act || B.phase === 'cards' || M.done ? 1 : 0.85; g.translate(fx, fy - bounce);   /* the waiting dancer stays visible — it reacts */ if(p.flip > 0){ g.translate(0, -s * 0.5); g.rotate(Math.PI * 2 * (1 - p.flip / 0.45)); g.translate(0, s * 0.5); }
    const DF = danceFrame(sd, act, beatPh, B, M, t); let drawn = false;
    if(DF){ g.save(); try{ g.scale((sd ? -1 : 1) * (DF.turn || 1), 1); Acting.draw(g, {name: p.name, av: G.avs[p.i]}, 0, 0, k * 1.6, DF, {t, dir: 1}); drawn = true; }catch(e){ drawn = false; G.dfErr = String(e && e.stack || e).slice(0, 300); } g.restore(); }
    if(!drawn){ const kq = k * 1.6 / G.sq; g.scale(sd ? -kq : kq, kq); g.drawImage(sprite(p.i, key), -SPR_FX * G.sq, -SPR_FY * G.sq); }
    g.restore();
    const L = B.last && B.last.side === sd ? B.last : null, u = L ? Math.min(1, (M.t - L.t) / Math.max(0.3, btDur(L.trick) - 0.12)) : 1, bp = ballAt(L && u < 1 ? L.trick : '', u, fx, fy - s * 0.1, s);
    drawSoccerBall(g, bp[0] + (sd ? -1 : 1) * (L && u < 1 ? 0 : s * 0.05), bp[1] - (act && !(L && u < 1) ? Math.abs(Math.sin(beatPh * Math.PI)) * s * 0.12 : 0), Math.max(5, s * 0.1), t * 4);
    g.font = '800 ' + Math.max(12, s * 0.13) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = sd ? '#FF8FA3' : '#8FD3FF'; g.fillText(G.tn[sd] + (B.wins[sd] ? ' ' + '🏆'.repeat(B.wins[sd]) : ''), fx, fy + s * 0.32);
    if(act && B.cur && B.cur.combo > 1){ g.fillStyle = '#FFD23F'; g.font = '900 ' + Math.max(14, s * 0.16) + 'px Fredoka, sans-serif'; g.fillText('×' + Math.min(5, 1 + Math.floor(B.cur.combo / 2)) + ' combo · ' + B.cur.pts, fx, fy - s * 1.25); } });
  // 3 judges at their table, cards up after each turn
  const J = judgesOf(), js = Math.min(H * 0.13, W * 0.07), jy = Math.min(bot, H * 0.98) - js * 0.2;
  g.fillStyle = 'rgba(8,16,40,0.8)'; g.fillRect(W / 2 - js * 2.4, jy - js * 0.35, js * 4.8, js * 0.45);
  J.forEach((n, i) => { const x = W / 2 + (i - 1) * js * 1.5, k = js * 1.5 / 160; g.save(); g.translate(x, jy - js * 0.2 + pulse * js * 0.05); g.rotate(Math.sin((t / B.beat + i * 0.33) * Math.PI) * 0.035); g.scale(k, k);   /* 🧑‍⚖️ the judges nod on the beat */ g.drawImage(judgeSprite(n), -SPR_FX, -SPR_FY); g.restore();
    if(B.phase === 'cards' && B.cards){ const up = Math.min(1, B.phaseT / 0.4) * (1 + 0 * i), cy = jy - js * (1.4 + up * 0.25); g.fillStyle = '#fff'; g.fillRect(x - js * 0.32, cy - js * 0.42, js * 0.64, js * 0.5); g.fillStyle = '#13254A'; g.font = '900 ' + Math.max(12, js * 0.34) + 'px Fredoka, sans-serif'; g.fillText(B.cards[i], x, cy - js * 0.06); g.font = '700 ' + Math.max(8, js * 0.16) + 'px Fredoka, sans-serif'; g.fillStyle = '#fff'; g.fillText(['🎵 timing', '🌈 variety', '✨ style'][i], x, cy + js * 0.22); } });
  if(B.phase === 'intro'){ const n = Math.max(1, 3 - Math.floor(B.phaseT / 0.8)); g.font = '900 ' + Math.max(40, s * 0.6) + 'px Fredoka, sans-serif'; g.fillStyle = '#FFD23F'; g.strokeStyle = '#13254A'; g.lineWidth = 6; g.strokeText(n, W * (B.turn ? 0.68 : 0.32), H * 0.4); g.fillText(n, W * (B.turn ? 0.68 : 0.32), H * 0.4); }
}
function drawDrill(g, t){
  const M = G.M, d = M.drill; if(!d) return; const S = G.Sz;
  if(d.id === 'target') d.targets.forEach(tg => { const r = 0.42, pts = []; for(let i = 0; i <= 20; i++){ const a = i / 20 * Math.PI * 2; pts.push([S.Lh, tg.y + Math.cos(a) * r, tg.z + Math.sin(a) * r]); }
    g.strokeStyle = tg.hit ? 'rgba(61,220,151,0.9)' : (Math.sin(t * 6) > 0 ? '#FF3B5C' : '#FFD23F'); g.lineWidth = Math.max(3, V.sc(S.Lh, tg.y, tg.z) * 0.12); g.beginPath(); polyline(g, V, pts); g.stroke();
    const f = V.P(S.Lh, tg.y, tg.z); if(f) emo(g, tg.hit ? '✅' : '🎯', f[0], f[1], Math.max(12, V.sc(S.Lh, tg.y, tg.z) * 0.5), 1); });
  if(d.id === 'bar'){ g.strokeStyle = 'rgba(255,210,63,' + (0.5 + 0.4 * Math.sin(t * 5)).toFixed(2) + ')'; g.lineWidth = Math.max(4, V.sc(S.Lh, 0, S.goalH) * 0.22); g.beginPath(); segW(g, V, [S.Lh, -S.goalW, S.goalH], [S.Lh, S.goalW, S.goalH]); g.stroke(); }
  if(d.id === 'cones'){ d.cones.forEach(cn => { const f = V.P(cn.x, cn.y, 0); if(f) emo(g, cn.hit ? '❌' : '🔶', f[0], f[1] - V.sc(cn.x, cn.y, 0) * 0.25, Math.max(12, V.sc(cn.x, cn.y, 0) * 0.7), 1); });
    g.strokeStyle = '#fff'; g.setLineDash([8, 6]); g.lineWidth = 3; g.beginPath(); segW(g, V, [d.finish, -3], [d.finish, 3]); g.stroke(); g.setLineDash([]); const ff = V.P(d.finish, 3.2, 1.6); if(ff) emo(g, '🏁', ff[0], ff[1], Math.max(16, V.sc(d.finish, 3, 1) * 0.9), 1); }
  if(d.id === 'juggle'){ const me = M.players[M.ctrls[0].pi], f = me && V.P(me.x, me.y, 3.2); if(f){ g.font = '900 ' + Math.max(28, V.sc(me.x, me.y, 3) * 1.1) + 'px Fredoka, sans-serif'; g.textAlign = 'center'; g.fillStyle = '#FFD23F'; g.strokeStyle = '#13254A'; g.lineWidth = 5; g.strokeText(d.score, f[0], f[1]); g.fillText(d.score, f[0], f[1]); } }
}
function drawSetPiece(g, t){
  const M = G.M, rs = M.rs;
  if(M.phase === 'restart' && rs){ const c = M.ctrls.find(x => x.pi === rs.taker && x.seat <= 1); if(c){
    const b = M.ball, at = Math.max(c.jAt, c.kAt), pw = at >= 0 ? Math.min(1, (M.t - at) / 0.75) : 0.35, L = (rs.kind === 'throw' ? 6 : 8) + pw * 12, am = Math.hypot(c.ax, c.ay) || 1, ax = c.ax / am, ay = c.ay / am, nx = -ay, ny = ax;
    const pts = []; for(let i = 0; i <= 14; i++){ const u = i / 14, bend = c.curve * Math.sin(u * Math.PI * 0.9) * u * 2.4; pts.push([b.x + ax * L * u + nx * bend, b.y + ay * L * u + ny * bend, 0.05]); }
    g.lineCap = 'round'; g.strokeStyle = 'rgba(19,37,74,0.45)'; g.lineWidth = Math.max(4, V.sc(b.x, b.y, 0) * 0.3); g.beginPath(); polyline(g, V, pts); g.stroke();
    g.strokeStyle = c.kAt >= 0 ? '#FF5A1F' : '#FFD23F'; g.lineWidth = Math.max(2, V.sc(b.x, b.y, 0) * 0.16); g.setLineDash([10, 7]); g.lineDashOffset = -t * 40; g.beginPath(); polyline(g, V, pts); g.stroke(); g.setLineDash([]);
    const e = pts[pts.length - 1], f = V.P(e[0], e[1], 0); if(f) emo(g, '🎯', f[0], f[1], Math.max(14, V.sc(e[0], e[1], 0) * 0.9), 1);
    if(rs.kind === 'throw' && M.level >= 2) M.players.forEach(q => { if(q.side !== c.side || q.gk || q.i === rs.taker) return; const r = gEll(V, q.x, q.y, 1 + Math.sin(t * 6) * 0.15); if(r){ g.strokeStyle = '#3DDC97'; g.lineWidth = 3; g.beginPath(); g.ellipse(r[0], r[1], r[2], r[3], 0, 0, 7); g.stroke(); } const top = V.P(q.x, q.y, 2.5); if(top) emo(g, '👆', top[0], top[1] - Math.abs(Math.sin(t * 5)) * 6, Math.max(14, V.sc(q.x, q.y, 2) * 0.55), 1); });
  } }
  const P = M.pens; if(M.phase === 'pens' && P && P.step === 'set' && M.ctrls.some(x => x.side === P.turn && x.seat <= 1)){ const d = BO.dirOf(P.turn, G.M), y = P.mk * G.Sz.goalW * 0.88, f = V.P(d * G.Sz.Lh, y, 1.0); if(f) emo(g, '🎯', f[0], f[1], Math.max(18, V.sc(d * G.Sz.Lh, y, 1) * 0.8), 1); }
}
function drawTrail(g){
  const b = G.M.ball; if(!(b.shot && b.shot.blast)){ G.trail = []; return; }
  (G.trail = G.trail || []).push([b.x, b.y, b.z + 0.24]); if(G.trail.length > 16) G.trail.shift();
  for(let i = 1; i < G.trail.length; i++){ const a = V.P(...G.trail[i - 1]), c = V.P(...G.trail[i]); if(!a || !c) continue; const k = i / G.trail.length; g.strokeStyle = 'rgba(255,' + Math.round(90 + 150 * k) + ',31,' + (0.25 + 0.65 * k).toFixed(2) + ')'; g.lineWidth = Math.max(3, V.sc(b.x, b.y, b.z) * 0.5 * k); g.lineCap = 'round'; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(c[0], c[1]); g.stroke(); }
  const c = V.P(b.x, b.y, b.z + 0.24); if(c) emo(g, '🔥', c[0] - b.vx * 0.4, c[1], Math.max(14, V.sc(b.x, b.y, b.z) * 0.7), 0.9);
}
function drawFrame(t){
  const cv = $('pitch'), g = cv.getContext('2d'); if(!V) return;
  g.setTransform(G.dpr, 0, 0, G.dpr, 0, 0);
  const M = G.M, Lk = LOOKS[G.theme], Sz = G.Sz;
  if(M.battle){ drawBattle(g, t, Lk); return; }
  drawWorld(g, V, Lk, Sz, t, G.night);
  drawTwist(g, t); drawGuides(g, t); drawSetPiece(g, t); drawTrail(g); drawDrill(g, t);
  // depth sort: goals, flags, players, ball (far first)
  const items = [];
  for(const s of [-1, 1]){ const c = V.toC(s * (Sz.Lh + 0.6), 0, 0); items.push({z: c[2], f: () => drawGoal(g, V, Sz, s, Lk)}); }
  if(!Sz.court) for(const [sx, sy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]){ const c = V.toC(sx * Sz.Lh, sy * Sz.Wh, 0); items.push({z: c[2], f: () => drawFlag(g, V, sx * Sz.Lh, sy * Sz.Wh, t)}); }
  M.players.forEach(p => { const c = V.toC(p.x, p.y, 0); items.push({z: c[2], f: () => drawPlayer(g, p, t)}); });
  const b = M.ball, bc = V.toC(b.x, b.y, 0); items.push({z: bc[2] - 0.05, f: () => drawBall(g, t)});
  items.sort((a, c) => c.z - a.z).forEach(it => { if(it.z > NEAR) it.f(); });
  if(Sz.cage) drawFence(g, V, Sz, Lk, G.night, 'near');
  drawWind(g);
  if(Lk.bubbles){ g.fillStyle = 'rgba(255,255,255,0.35)'; for(let i = 0; i < 16; i++){ const x = (i * 131.7) % V.W, y = V.H - ((t * 40 + i * 77) % (V.H + 40)); g.beginPath(); g.arc(x, y, 2 + (i % 3), 0, 7); g.fill(); } }
  // power ring while you hold J / K
  M.ctrls.forEach(c => { const p = M.players[c.pi]; if(!p || M.ball.owner !== p.i) return; const at = Math.max(c.jAt, c.kAt); if(at < 0) return; const pw = Math.min(1, (M.t - at) / 0.75), f = V.P(p.x, p.y, 0); if(!f) return; const r = Math.max(12, V.sc(p.x, p.y, 0) * 0.9);
    g.lineWidth = 5; g.strokeStyle = 'rgba(0,0,0,0.35)'; g.beginPath(); g.arc(f[0], f[1] - r * 2.6, r * 0.6, 0, 7); g.stroke(); g.strokeStyle = c.kAt >= 0 ? '#FF5A1F' : '#2DBE6C'; g.beginPath(); g.arc(f[0], f[1] - r * 2.6, r * 0.6, -Math.PI / 2, -Math.PI / 2 + pw * Math.PI * 2); g.stroke(); });
}

/* ---------- 📡 radar mini-map (11v11, and 7v7 when zoomed in): the whole pitch, both teams, the ball, you, the part the camera shows ---------- */
function radarOn(){ return G && (G.size === 11 || (G.size === 7 && G.zoom)); }
function drawRadar(){
  const cv = $('radar'); if(!radarOn()){ cv.classList.add('hidden'); return; } cv.classList.remove('hidden');
  const Sz = G.Sz, M = G.M, w = Math.round(lim(G.W * 0.19, 92, 168)), h = Math.round(w * Sz.Wh / Sz.Lh), dpr = G.dpr || 1;
  if(cv.width !== Math.round(w * dpr)){ cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr); cv.style.width = w + 'px'; cv.style.height = h + 'px'; }
  const g = cv.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0); g.clearRect(0, 0, w, h);
  const flip = G.view.mode === 'behind' && G.view.side === 1 ? -1 : 1, X = x => (x * flip / Sz.Lh + 1) / 2 * (w - 6) + 3, Y = y => (-y * flip / Sz.Wh + 1) / 2 * (h - 6) + 3;
  g.fillStyle = 'rgba(30,110,60,0.85)'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,0.7)'; g.lineWidth = 1; g.strokeRect(3, 3, w - 6, h - 6); g.beginPath(); g.moveTo(w / 2, 3); g.lineTo(w / 2, h - 3); g.stroke();
  [-1, 1].forEach(s => { const x0 = X(s * Sz.Lh), x1 = X(s * (Sz.Lh - Sz.boxL)); g.strokeRect(Math.min(x0, x1), Math.min(Y(Sz.boxW), Y(-Sz.boxW)), Math.abs(x1 - x0), Math.abs(Y(-Sz.boxW) - Y(Sz.boxW))); });
  M.players.forEach(p => { g.fillStyle = p.gk ? (p.side ? '#4CB963' : '#FFD23F') : TEAM_COL[p.side]; g.beginPath(); g.arc(X(p.x), Y(p.y), p.ctrl >= 0 ? 3.6 : 2.6, 0, 7); g.fill(); if(p.ctrl >= 0){ g.strokeStyle = SEAT_COL[M.ctrls[p.ctrl].seat % 2]; g.lineWidth = 1.6; g.beginPath(); g.arc(X(p.x), Y(p.y), 5.2, 0, 7); g.stroke(); } });
  g.fillStyle = '#FFFFFF'; g.strokeStyle = '#13254A'; g.lineWidth = 1; g.beginPath(); g.arc(X(M.ball.x), Y(M.ball.y), 2.6, 0, 7); g.fill(); g.stroke();
  if(V){ const pts = [[0.05, 0.3], [0.95, 0.3], [0.95, 0.98], [0.05, 0.98]].map(([a, b2]) => groundAt(V.W * a, V.H * b2)).filter(Boolean);
    if(pts.length === 4){ g.strokeStyle = 'rgba(255,255,255,0.6)'; g.setLineDash([3, 2]); g.beginPath(); pts.forEach((q, i) => g[i ? 'lineTo' : 'moveTo'](X(lim(q.x, -Sz.Lh, Sz.Lh)), Y(lim(q.y, -Sz.Wh, Sz.Wh)))); g.closePath(); g.stroke(); g.setLineDash([]); } }
}
// a screen point → the ground point under it (the camera box on the radar)
function groundAt(px, py){ const e = V.eye, l = V.look; let fx = l[0] - e[0], fy = l[1] - e[1], fz = l[2] - e[2]; const fm = Math.hypot(fx, fy, fz); fx /= fm; fy /= fm; fz /= fm; let rx = fy, ry = -fx; const rm = Math.hypot(rx, ry) || 1; rx /= rm; ry /= rm; const ux = ry * fz, uy = -rx * fz, uz = rx * fy - ry * fx;
  const a = (px - V.cx) / V.F, b = -(py - V.cy) / V.F, dx = fx + rx * a + ux * b, dy = fy + ry * a + uy * b, dz = fz + uz * b; if(dz >= -1e-3) return null; const t = -e[2] / dz; return {x: e[0] + dx * t, y: e[1] + dy * t}; }

/* ---------- loop ---------- */
function frame(now){
  if(!G) return;
  const dt = Math.min(0.05, Math.max(0, (now - G.last) / 1000)); G.last = now;
  const halted = G.paused || G.over || G.turnPause || G.hold;
  if(!halted){
    readInputs();
    G.acc += dt; let n = 0;
    while(G.acc >= BO.DT && n < 10){ BO.step(G.M, BO.DT); G.acc -= BO.DT; n++; }
    if(n >= 10) G.acc = 0;
    const evs = BO.takeEvents(G.M); handleEvents(evs);
    if(G.M.done && !G.endAt) G.endAt = now;
  }
  if(G.endAt && !G.over && now - G.endAt > (FX ? 1400 : 50)) finishMatch();
  if(!G) return;
  updateCam(dt); drawFrame(now / 1000); drawRadar(); hud(now);
  G.raf = requestAnimationFrame(frame);
}
function togglePause(){ if(!G || G.over) return; G.paused = !G.paused; UI.pauseIcon($('pause-btn'), G.paused); banner(G.paused ? '⏸ Paused — tap ▶ to play' : '▶ Go!', 'good'); if(!G.paused) G.last = performance.now(); }
function cycleView(){ if(!G) return; const o = ['behind', 'side', 'top'], cur = G.view.mode; SET.view = o[(o.indexOf(cur) + 1) % 3]; savePrefs(); G.view = viewMode(); G.cam = null;
  $('pads').querySelectorAll('.shouts').forEach(sh => { const l = shoutLabels(); sh.querySelectorAll('.shout').forEach((bt, i) => { bt.firstChild.textContent = l[i].split(' ')[0]; }); });
  UISound.play('pop'); banner({behind: '📷 Behind your team', side: '📷 From the side', top: '📷 From above'}[G.view.mode] + ' · ' + (isTouch() ? 'tap 📷 again to change' : 'V = change'), 'good'); }
function toggleZoom(){ if(!G) return; G.zoom = !G.zoom; ls(store('zoom' + G.size), G.zoom ? '1' : '0'); const b = $('zoom-btn'); if(b) b.classList.toggle('gb-on', G.zoom); banner(G.zoom ? '🔍 Zoomed in — closer to the ball' : '🔭 Wide view — see the whole team', 'good'); }
function pauseGame(){ if(G && !G.paused && !G.over){ G.paused = true; UI.pauseIcon($('pause-btn'), true); } }
function leavePlay(){
  if(!G) return; const was = G.paused; G.paused = true;
  UI.confirm({icon: '◀', title: 'Leave this match?', body: 'This match won\'t be saved.', okText: 'Leave', cancelText: 'Keep playing'}).then(ok => { if(!G) return; G.paused = was; G.last = performance.now(); if(ok) backToMenu(); });
}
function backToMenu(){ if(G) cancelAnimationFrame(G.raf); G = null; V = null; hideResult(); $('pads').innerHTML = ''; ['goal-line', 'kb-hint', 'shout-kb', 'moment', 'sp-hint'].forEach(id => $(id).classList.add('hidden')); renderMenu(); showScreen('menu'); }
function checkTurn(){
  if(!G) return; const up = phoneUpright(); $('turn-card').classList.toggle('hidden', !up); $('pads').classList.toggle('hidden', up);
  if(up && !G.turnPause){ G.turnPause = true; } else if(!up && G.turnPause){ G.turnPause = false; G.last = performance.now(); }
}
let hudLast = '';
function hud(now){
  const M = G.M, left = M.drill ? (M.drill.id === 'cones' ? M.drill.t : M.drill.limit - M.drill.t) : M.golden ? null : (M.half === 1 || G.Sz.oneHalf ? M.halfLen - M.clock : M.halfLen * 2 - M.clock);
  const key = M.score.join(':') + '|' + (left == null ? 'gg' : Math.ceil(left)) + '|' + M.half + '|' + M.phase + (M.battle ? '|' + M.battle.phase + Math.ceil(M.battle.phaseT) + M.battle.round : '');
  if(key !== hudLast){ hudLast = key;
    BAR.players([0, 1].map(i => ({k: i, av: (Array.from(G.tn[i] || '?')[0] || '?').toUpperCase(), name: G.tn[i], score: M.score[i], col: TEAM_COL[i]})));
    if(M.battle) ; else if(M.phase === 'pens' && M.pens) BAR.time('🥅 ' + M.pens.g[0] + '–' + M.pens.g[1]); else BAR.time(left == null ? '⚡ GG' : fmt(left), left != null && left < 15);
    if(M.battle){ const B = M.battle; BAR.round(B.round, 3); BAR.time(B.phase === 'turn' ? fmt(Math.max(0, B.turnLen - B.phaseT)) : B.phase === 'cards' ? '🃏' : '🎵', B.phase === 'turn' && B.turnLen - B.phaseT < 5); }
    else if(M.drill){ const D = BO.DRILLS[M.drill.id]; BAR.round(Math.max(1, M.drill.n), D.balls || 1); BAR.players([{k: 0, av: '🎯', name: G.tn[0], score: M.drill.id === 'cones' ? M.drill.cones.filter(c => c.hit).length : M.drill.score, col: TEAM_COL[0]}]); }
    else BAR.round(Math.min(2, M.half), G.Sz.oneHalf ? 1 : 2);
  }
  if(M.L.stamina){ const c = M.ctrls[0], p = c && M.players[c.pi]; if(p) BAR.meter('sta', '💨', p.stamina, 'Stamina — sprinting uses it up', p.stamina < 0.25); }
  { const c = M.ctrls[0]; if(c && innerWidth >= 520 && !phoneLand() && G.starShown !== c.star){   /* 🔥 star meter (narrow upright phones: the turn card shows, the bar keeps its height) */ G.starShown = c.star; BAR.meter('star', '🔥', c.star, 'Star meter — ⚡ perfect moments, tricks, tackles and goals fill it · full = a 🔥 BLAST shot'); } }
  updateMoments(); updateSetPiece();
  updateHints(now);
}
// 🌱 the goal line + first-move hand (Basic), keyboard hint, 📣 shout arrows when a shot is coming at a person's goal
// ⚡ bo-2c: the prompt bubble over your player + the matching button pulses (keys show the key)
const MO_TXT = {beat: ['Trick past them!', 'trick'], air: ['Hit it in the air!', 'shoot'], oneone: ['Finish it!', 'shoot']};
function updateMoments(){
  const M = G.M, el = $('moment'), c = M.ctrls.find(x => x.mo && x.seat <= 1);
  G.btn.forEach((B, ci) => { const cc = M.ctrls[ci], want = cc && cc.mo ? MO_TXT[cc.mo.kind][1] : ''; ['pass', 'shoot', 'trick', 'jump'].forEach(a => B[a] && B[a].classList.toggle('mo', a === want)); if(B.shoot) B.shoot.classList.toggle('blast', !!(cc && cc.star >= 1)); });
  if(!c || G.over || !V){ el.classList.add('hidden'); return; }
  const p = M.players[c.pi], f = (p && V.P(p.x, p.y, 2.9)) || [G.W / 2, G.H - G.box.b];   // off camera → just above the pads
  const K = keySetsOf(c)[0], T = MO_TXT[c.mo.kind], key = isTouch() && !$('pads').classList.contains('kbd') ? {trick: '🌀', shoot: '💥'}[T[1]] : keyName(K[T[1]]);
  el.querySelector('.mo-k').textContent = key; el.querySelector('.mo-t').textContent = '⚡ ' + T[0];
  el.querySelector('.mo-bar u').style.width = Math.max(0, 100 * (1 - (M.t - c.mo.t) / c.mo.win)) + '%';
  el.style.left = lim(f[0], 90, G.W - 90) + 'px'; el.style.top = lim(f[1], 96, G.H - G.box.b * 0.6) + 'px'; el.classList.remove('hidden');   // always on screen (above the pads)
}
// 🎯 set pieces: what your keys do while you take one (+ the moving penalty target)
function updateSetPiece(){
  const M = G.M, el = $('sp-hint'), rs = M.rs, c = rs && M.ctrls.find(x => x.pi === rs.taker && x.seat <= 1);
  let txt = '';
  const touch = isTouch() && !$('pads').classList.contains('kbd'), K = c ? keySetsOf(c)[0] : KEYS[0], k = a => touch ? {pass: '⚽', shoot: '💥', trick: '🌀'}[a] : keyName(K[a]);
  const askC = M.phase === 'restart' && rs && rs.ask && M.ctrls.find(x => x.side === rs.side && x.seat <= 1);
  if(askC){ const K2 = keySetsOf(askC)[0]; txt = '🧤 Your goal kick — run to a free space, then <b>' + (touch ? '🙋' : keyName(K2.pass)) + '</b> = "to me!" · the keeper waits ' + Math.max(0, Math.ceil(rs.wait - M.phaseT)) + ' s'; }
  else if(M.phase === 'restart' && c && rs){
    const bend = c.curve > 0 ? '↪️' : c.curve < 0 ? '↩️' : '⬆️';
    const hi = '<b>' + k('pass') + '+' + k('trick') + '</b> 🌀 flip pass';
    if(rs.kind === 'corner') txt = '🚩 Corner: 🎯 aim · <b>' + k('pass') + '</b> pass · ' + hi + ' · <b>' + k('trick') + '</b> bend ' + bend;
    else if(rs.kind === 'free') txt = '🟢 Free kick: 🎯 aim · <b>' + k('shoot') + '</b> shoot (hold = power) · <b>' + k('pass') + '</b> pass · <b>' + k('trick') + '</b> bend ' + bend + (rs.wall ? ' round the 🧱' : '');
    else if(rs.kind === 'throw') txt = '🙌 Throw-in: aim + <b>' + k('pass') + '</b> · ' + hi.replace('flip pass', 'flip throw (over the head)') + (M.level >= 2 ? ' · 👆 or tap a teammate' : '');
    else if(rs.kind === 'kickin') txt = '🦶 Kick-in: aim + <b>' + k('pass') + '</b> · ' + hi + ' · <b>' + k('trick') + '</b> bend ' + bend;
  } else if(M.battle && M.battle.phase !== 'cards' && !(isTouch() && phoneLand()) && M.ctrls.some(x => x.side === M.battle.turn && x.seat <= 1)){ const K2 = keySetsOf(M.ctrls.find(x => x.side === M.battle.turn))[0], kk = a => touch ? {pass: '🦶', shoot: '🌈', trick: '🌀', jump: '🦵'}[a] : keyName(K2[a]); txt = '🎵 ON the beat: <b>' + kk('pass') + '</b> stepover · <b>' + kk('shoot') + '</b> rainbow · <b>' + kk('trick') + '</b> around · <b>' + kk('jump') + '</b> knee · <b>' + kk('pass') + '+' + kk('shoot') + '</b> 🧢 neck · 🎮 <b>' + (touch ? '⬆️🔄😎⬇️' : ['up', 'left', 'right', 'down'].map(d => keyName(K2[d])).join('')) + '</b> + a trick = combo'; { const tp = comboTip(M); if(tp) txt += ' · try <b>' + tp.label + '</b>'; }
  } else if(M.phase === 'pens' && M.pens && M.pens.step === 'set' && M.ctrls.some(x => x.side === M.pens.turn && x.seat <= 1)) txt = '🎯 Watch the target slide — <b>' + k('shoot') + '</b> when it is where you want!';
  if(txt){ if(el.innerHTML !== txt) el.innerHTML = txt; el.classList.remove('hidden'); $('kb-hint').classList.add('hidden'); } else el.classList.add('hidden');
}
function updateHints(now){
  const M = G.M, me = M.ctrls[0], gl = $('goal-line');
  const showGoal = G.help >= 1 && M.score[0] + M.score[1] === 0 && !G.over && M.phase !== 'pens';
  if(M.battle){ const bt = isTouch() && phoneLand() && !G.over && M.battle.phase === 'turn' && M.ctrls.some(x => x.side === M.battle.turn && x.seat <= 1) ? (comboTip(M) ? '🎮 Try ' + comboTip(M).label + ' — both thumbs on the beat!' : '🎵 Tap a trick when the ring closes on you — left + right together = a COMBO!') : '';   /* 🎤 not the match goal line (Aowu's iPhone 16:27) */
    if(bt){ if(gl.innerHTML !== bt) gl.innerHTML = bt; gl.classList.remove('hidden'); } else gl.classList.add('hidden'); }
  else if(showGoal){ const vm = G.view.mode, where = vm === 'behind' ? 'at the top' : vm === 'side' ? (me && BO.dirOf(me.side, M) > 0 ? 'on the right ▶' : '◀ on the left') : (me && BO.dirOf(me.side, M) > 0 ? 'on the right ▶' : '◀ on the left');
    const txt = M.ball.owner === (me ? me.pi : -2) ? '⚽ Shoot with <b>' + (isTouch() ? '💥' : 'K') + '</b> — the 🥅 is ' + where + '!' + (G.Sz.nokeeper ? ' Or 🥜 <b>' + (isTouch() ? '🌀' : 'L') + '</b> when they stand in front = nutmeg!' : G.help >= 2 ? ' Or pass to the <b>glowing</b> friend' : '') : '⚽ Get the ball and score in the 🥅 ' + where + '!';
    if(gl.innerHTML !== txt) gl.innerHTML = txt; gl.classList.remove('hidden'); } else gl.classList.add('hidden');
  const kb = $('kb-hint'), moved = me && me.moved;
  if(!isTouch() && G.help >= 1 && !moved && !G.over){ const K = KEYS[0]; kb.innerHTML = '⌨️ Run <kbd>' + keyName(K.up) + '</kbd><kbd>' + keyName(K.left) + '</kbd><kbd>' + keyName(K.down) + '</kbd><kbd>' + keyName(K.right) + '</kbd> · pass <kbd>' + keyName(K.pass) + '</kbd> · shoot <kbd>' + keyName(K.shoot) + '</kbd>'; kb.classList.remove('hidden'); } else kb.classList.add('hidden');
  const hand = $('pads').querySelector('.hand'); if(hand) hand.classList.toggle('hidden', !!moved || !G.help);
  // 📣 a threat at a person's goal → arrows / key hint for ~1.5 s after
  const b = M.ball, t = M.t;
  [0, 1].forEach(side => {
    if(!M.ctrls.some(c => c.side === side) || G.Sz.nokeeper) return;
    const d = BO.dirOf(side, G.M), gx = -d * G.Sz.Lh, own = b.owner >= 0 ? M.players[b.owner] : null;
    const threat = M.phase === 'play' && ((b.shot && b.shot.side !== side) || (own && own.side !== side && Math.hypot(own.x - gx, own.y) < G.Sz.boxL + 10)) || (M.phase === 'pens' && M.pens && M.pens.turn !== side && M.pens.step === 'set');
    if(threat) G.shoutShow[side] = t + 1.2;
  });
  const showSh = [0, 1].map(s => G.shoutShow[s] > t);
  $('pads').querySelectorAll('.shouts').forEach(el => el.classList.toggle('hidden', !showSh[+el.dataset.side]));
  const sk = $('shout-kb'); if(!isTouch() && showSh.some(Boolean)){ const s = showSh[0] ? 0 : 1, K = KEYS[M.ctrls.find(c => c.side === s).seat] || KEYS[0], lab = shoutLabels(); const txt = '📣 Tell your keeper: ' + keyName(K.shoutL) + ' = ' + lab[0] + ' · ' + keyName(K.shoutR) + ' = ' + lab[1]; if(sk.textContent !== txt) sk.textContent = txt; sk.classList.remove('hidden'); } else sk.classList.add('hidden');
  // touch buttons: labels for attack / defence, glow Shoot when the goal is close (Basic)
  $('pads').classList.toggle('notip', !(G.level === 0 && M.t < 10));   // 📱 the stick's "run · push far = sprint" tip: only the first 10 s of 🌱 Basic on phones
  G.btn.forEach((B, ci) => { const c = M.ctrls[ci], p = M.players[c.pi], has = p && b.owner === p.i, ask = M.phase === 'restart' && M.rs && M.rs.ask && M.rs.side === c.side, mode = ask ? 'ask' : has ? 'att' : 'def';
    if(M.battle){ if(B.mode !== 'battle'){ B.mode = 'battle'; setBtn(B.pass, ['🦶', 'Stepover']); setBtn(B.shoot, ['🌈', 'Rainbow']); setBtn(B.trick, ['🌀', 'Around']); setBtn(B.jump, ['🦵', 'Knee']); }   // 🎤 battle buttons
      const tp = c.side === M.battle.turn ? comboTip(M) : null, rb = {J: B.pass, K: B.shoot, L: B.trick, SP: B.jump}; Object.keys(rb).forEach(k => rb[k].classList.toggle('glow', !!tp && tp.ball === k));
      $('pads').querySelectorAll('.bodypad .bbtn').forEach(el => el.classList.toggle('glow', !!tp && tp.body === el.dataset.k && el.closest('.bodypad').classList.contains(B.where || 'solo'))); return; }
    if(B.mode !== mode && mode === 'ask'){ B.mode = mode; setBtn(B.pass, ['🙋', 'To me!']); setBtn(B.shoot, ['💥', 'Shoot']); setBtn(B.trick, ['🌀', 'Trick']); }   // 🙋 our goal kick: Pass = ask the keeper
    if(B.mode !== mode){ B.mode = mode; setBtn(B.pass, has ? ['⚽', 'Pass'] : ['🦶', 'Tackle']); setBtn(B.shoot, has ? ['💥', 'Shoot'] : M.L.slide ? ['🛝', 'Slide'] : ['🦶', 'Tackle']); setBtn(B.trick, has ? ['🌀', 'Trick'] : ['📣', 'Help!']); }
    const h = has && G.help >= 1 ? BO.hint(M, ci) : null; B.shoot.classList.toggle('glow', !!(h && h.shoot)); B.pass.classList.toggle('glow', ask || !!(h && !h.shoot && h.pass >= 0 && G.help >= 2));
    const at = c.kAt >= 0 ? c.kAt : c.jAt, el = c.kAt >= 0 ? B.shoot : B.pass, pw = at >= 0 && has ? Math.min(1, (M.t - at) / 0.75) : 0; [B.pass, B.shoot].forEach(x => x.style.setProperty('--p', x === el ? pw.toFixed(2) : 0)); });
}
function comboTip(M){   // 🌱 Basic / 🌿 Junior: a combo to try (glows on the buttons), a new one every 4 beats, one you haven't done this turn
  const B = M.battle; if(!B || B.phase !== 'turn' || G.level > 1 || !M.ctrls.some(c => c.side === B.turn && c.seat <= 1)) return null;
  const all = Object.keys(BO.BTRICK).filter(k => k.indexOf('+') > 0), fresh = all.filter(k => !(B.cur.used || {})[BO.BTRICK[k][0]]), list = fresh.length ? fresh : all, k = list[Math.floor(B.phaseT / B.beat / 4) % list.length];
  const [b, r] = k.split('+'), bk = BODY_KEY.find(x => x[1] === b), ri = {J: '🦶', K: '🌈', L: '🌀', SP: '🦵'}[r];
  return {key: k, body: b, ball: r, label: bk[2] + ' + ' + ri + ' = ' + BO.BTRICK[k][1]};
}
const BODY_KEY = [['up', 'U', '⬆️', 'Hop', 'hop'], ['left', 'LF', '🔄', 'Spin', 'spin'], ['right', 'RT', '😎', 'Show', 'show'], ['down', 'D', '⬇️', 'Drop', 'drop']];   // 🎮 bo-5c-3 the left thumb in the battle
function setBtn(el, [ic, nm]){ el.querySelector('.ic').textContent = ic; el.querySelector('.nm').textContent = nm; }
function shoutLabels(){ return G.view.mode === 'side' ? ['⬆️ far side', '⬇️ near side'] : ['⬅️ left', '➡️ right']; }
// a screen arrow → which way along the goal line (world y) for this camera
function shoutWorld(dirScreen){ const s = G.view.mode === 'side' ? V.k2w(0, dirScreen) : V.k2w(dirScreen, 0); return s.y >= 0 ? 1 : -1; }

/* ---------- input ---------- */
function touchCtrls(){ return G ? G.M.ctrls.filter(c => c.seat <= 1) : []; }
document.addEventListener('keydown', e => {
  if(takeKey(e)) return;
  if(!G || $('scr-play').classList.contains('hidden')) return;
  if(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space', 'PageUp', 'PageDown', 'Home', 'End'].indexOf(e.code) >= 0) e.preventDefault();
  if(e.code === 'Escape' || e.code === 'KeyP'){ if(!e.repeat) togglePause(); return; }
  if(e.code === 'KeyZ' && !keySetsOf(G.M.ctrls[0]).some(K => Object.values(K).includes('KeyZ'))){ if(!e.repeat) toggleZoom(); return; }
  if(e.code === 'KeyV' && !keySetsOf(G.M.ctrls[0]).some(K => Object.values(K).includes('KeyV'))){ if(!e.repeat) cycleView(); return; }
  if(e.repeat) return;
  G.held.add(e.code); $('pads').classList.add('kbd');
  if(G.paused || G.over || G.turnPause) return;
  G.M.ctrls.forEach(c => keySetsOf(c).forEach(K => {
    Object.keys(LOGIC).forEach(a => { if(K[a] === e.code) BO.key(G.M, c.ci, LOGIC[a], true); });
    if(K.sw === e.code) BO.key(G.M, c.ci, 'C', true);
    if(G.M.battle){ const bk = BODY_KEY.find(([d]) => K[d] === e.code); if(bk) BO.key(G.M, c.ci, bk[1], true); }   // 🎮 battle: the move keys = body moves
    if(K.shoutL === e.code) BO.shout(G.M, c.ci, shoutWorld(-1));
    if(K.shoutR === e.code) BO.shout(G.M, c.ci, shoutWorld(1));
  }));
});
document.addEventListener('keyup', e => {
  if(!G) return; G.held.delete(e.code);
  G.M.ctrls.forEach(c => keySetsOf(c).forEach(K => Object.keys(LOGIC).forEach(a => { if(K[a] === e.code) BO.key(G.M, c.ci, LOGIC[a], false); })));
});
window.addEventListener('blur', () => { if(G) G.held.clear(); });
// 🙌 throw-in (🔥 Intermediate+): tap a teammate on the pitch
document.addEventListener('pointerdown', e => {
  if(!G || !V || G.paused || G.over) return; const M = G.M, rs = M.rs; if(M.phase !== 'restart' || !rs || rs.kind !== 'throw' || M.level < 2) return;
  const c = M.ctrls.find(x => x.pi === rs.taker && x.seat <= 1); if(!c) return;
  const st = $('stage').getBoundingClientRect(), x = e.clientX - st.left, y = e.clientY - st.top; let best = null, bd = 70;
  M.players.forEach(q => { if(q.side !== c.side || q.gk || q.i === rs.taker) return; const f = V.P(q.x, q.y, 1); if(!f) return; const d = Math.hypot(f[0] - x, f[1] - y); if(d < bd){ bd = d; best = q; } });
  if(best && BO.throwTo(M, c.ci, best.i)){ UISound.play('pop'); floatAt(best, '🙌 to you!'); }
}, true);
function keySetsOf(c){ return G.M.ctrls.length === 1 ? [KEYS[0], KEYS[1]] : [KEYS[c.seat] || KEYS[0]]; }
function readInputs(){
  const M = G.M;
  M.ctrls.forEach(c => {
    const st = G.sticks.get(c.ci); let sx = 0, sy = 0, sprint = false;
    if(st && st.v){ const m = Math.hypot(st.v.x, st.v.y); if(m > 0.14){ const k = Math.min(1, m) / m; sx = st.v.x * k; sy = st.v.y * k; sprint = m > 0.96; } }
    else { keySetsOf(c).forEach(K => { if(G.held.has(K.left)) sx -= 1; if(G.held.has(K.right)) sx += 1; if(G.held.has(K.up)) sy -= 1; if(G.held.has(K.down)) sy += 1; if(G.held.has(K.sprint)) sprint = true; });
      sx = lim(sx, -1, 1); sy = lim(sy, -1, 1); const m = Math.hypot(sx, sy); if(m > 1){ sx /= m; sy /= m; } }
    const w = V ? V.k2w(sx, sy) : {x: sx, y: sy}; BO.input(M, c.ci, w.x, w.y, sprint);
  });
}
// 🕹️ touch: the shared UiKit stick + 4 big buttons per person on this device; Trick then Pass / Shoot = trick pass / shot; double-tap Jump = flick it up
function buildPads(){
  const box = $('pads'); box.innerHTML = ''; G.sticks = new Map(); G.btn = new Map();
  const cs = touchCtrls(), two = cs.length > 1, short = G.H < 520 && G.W > G.H;
  box.classList.toggle('two', two); box.classList.toggle('short', short); box.classList.toggle('battle', G.kind === 'battle');   /* 🎤 the battle is played with the 4 trick buttons only — no stick */
  cs.forEach((c, n) => {
    const where = !two ? 'solo' : n === 0 ? 'lside' : 'rside', K = keySetsOf(c)[0];
    const st = document.createElement('div'); st.className = 'stick ' + where; st.innerHTML = '<div class="ring"></div><div class="knob"></div><span class="tip">🕹️ run · push far = sprint</span>';
    const pad = document.createElement('div'); pad.className = 'btnpad ' + where;
    const mk = (cls, ic, nm, key) => '<button class="bbtn ' + cls + '" data-a="' + cls.slice(2) + '"><span class="pw"></span><span class="ic">' + ic + '</span><span class="nm">' + nm + '</span><small>' + UI.esc(keyName(key)) + '</small></button>';
    pad.innerHTML = mk('b-trick', '🌀', 'Trick', K.trick) + mk('b-shoot', '💥', 'Shoot', K.shoot) + mk('b-jump', '🦘', 'Jump', K.jump) + mk('b-pass', '⚽', 'Pass', K.pass);
    const sw = document.createElement('button'); sw.className = 'swbtn'; sw.textContent = '🔄'; sw.title = 'Switch player (' + keyName(K.sw) + ')';
    const B = {pass: pad.querySelector('.b-pass'), shoot: pad.querySelector('.b-shoot'), trick: pad.querySelector('.b-trick'), jump: pad.querySelector('.b-jump'), mode: '', trickAt: -1, trickTimer: 0, comboL: false, where};
    G.btn.set(c.ci, B);
    const press = (el, down) => { el.classList.toggle('down', down); if(down && navigator.vibrate) try{ navigator.vibrate(8); }catch(e){} };
    const has = () => { const p = G.M.players[c.pi]; return p && G.M.ball.owner === p.i; };
    [['pass', 'J'], ['shoot', 'K']].forEach(([a, L]) => {
      const el = B[a];
      el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try{ el.setPointerCapture(e.pointerId); }catch(err){} press(el, true); $('pads').classList.remove('kbd'); if(!G || G.paused) return;
        if(B.trickTimer && performance.now() - B.trickAt < 500){ clearTimeout(B.trickTimer); B.trickTimer = 0; BO.key(G.M, c.ci, 'L', true); B.comboL = true; }
        BO.key(G.M, c.ci, L, true); });
      const up = e => { press(el, false); if(!G) return; BO.key(G.M, c.ci, L, false); if(B.comboL){ BO.key(G.M, c.ci, 'L', false); B.comboL = false; } };
      el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    });
    B.trick.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); press(B.trick, true); if(!G || G.paused) return;
      if(!has()){ BO.key(G.M, c.ci, 'L', true); BO.key(G.M, c.ci, 'L', false); return; }
      B.trickAt = performance.now(); clearTimeout(B.trickTimer); B.trickTimer = setTimeout(() => { B.trickTimer = 0; if(G){ BO.key(G.M, c.ci, 'L', true); BO.key(G.M, c.ci, 'L', false); } }, 330); });
    ['pointerup', 'pointercancel'].forEach(k => B.trick.addEventListener(k, () => press(B.trick, false)));
    B.jump.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); press(B.jump, true); if(G && !G.paused) BO.key(G.M, c.ci, 'SP', true); });
    ['pointerup', 'pointercancel'].forEach(k => B.jump.addEventListener(k, () => { press(B.jump, false); if(G) BO.key(G.M, c.ci, 'SP', false); }));
    sw.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if(G && !G.paused){ BO.key(G.M, c.ci, 'C', true); UISound.play('tap'); } });
    if(G.kind === 'battle'){   // 🎮 bo-5c-3: the left thumb gets 4 body moves where the stick was — press one WITH a trick = a combo
      const bp = document.createElement('div'); bp.className = 'bodypad ' + where;
      bp.innerHTML = BODY_KEY.map(([d, L, ic, nm, cl]) => '<button class="bbtn b-' + cl + '" data-k="' + L + '"><span class="ic">' + ic + '</span><span class="nm">' + nm + '</span><small>' + UI.esc(keyName(K[d])) + '</small></button>').join('');
      bp.querySelectorAll('.bbtn').forEach(el => { el.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try{ el.setPointerCapture(e.pointerId); }catch(err){} press(el, true); $('pads').classList.remove('kbd'); if(G && !G.paused) BO.key(G.M, c.ci, el.dataset.k, true); });
        ['pointerup', 'pointercancel'].forEach(k => el.addEventListener(k, () => { press(el, false); if(G) BO.key(G.M, c.ci, el.dataset.k, false); })); });
      box.appendChild(bp);
    }
    // 📣 shout arrows (pop up when a shot is coming)
    const sh = document.createElement('div'); sh.className = 'shouts hidden'; sh.dataset.side = c.side; const lab = () => shoutLabels();
    sh.innerHTML = '<button class="shout" data-d="-1">' + lab()[0].split(' ')[0] + '<small>📣 shout</small></button><button class="shout" data-d="1">' + lab()[1].split(' ')[0] + '<small>📣 shout</small></button>';
    if(two) sh.style.left = n === 0 ? '30%' : '70%';
    sh.querySelectorAll('.shout').forEach(bt => bt.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if(G && !G.paused){ BO.shout(G.M, c.ci, shoutWorld(+bt.dataset.d)); UISound.play('pop'); bt.animate([{transform: 'scale(1.3)'}, {transform: 'scale(1)'}], 250); } }));
    // the shared stick (wears this player's joystick skin) → screen direction
    const T = UI.stickTracker(st, {player: c.name, av: myAvatar(c.name), buttons: pad}), kn = st.querySelector('.knob'), SS = {id: null, v: null};
    const show = v => { const m = Math.min(1, Math.hypot(v.fx, v.fy)), k = m > 0 ? Math.min(1, m) / m : 0; kn.style.transform = 'translate(calc(-50% + ' + (v.fx * k * 38) + '%), calc(-50% + ' + (v.fy * k * 38) + '%))'; st.classList.toggle('far', Math.hypot(v.x, v.y) > 0.96); };
    st.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); try{ st.setPointerCapture(e.pointerId); }catch(err){} SS.id = e.pointerId; SS.v = T.start(e); show(SS.v); st.classList.add('on'); $('pads').classList.remove('kbd'); });
    UI.onFastMove(st, e => { if(e.pointerId !== SS.id) return; SS.v = T.at(e); show(SS.v); });
    const end = e => { if(e.pointerId !== SS.id) return; SS.id = null; SS.v = null; kn.style.transform = ''; st.classList.remove('on', 'far'); };
    st.addEventListener('pointerup', end); st.addEventListener('pointercancel', end);
    G.sticks.set(c.ci, SS);
    box.appendChild(st); box.appendChild(pad); if(G.Sz.n > 1) box.appendChild(sw); if(!G.Sz.nokeeper) box.appendChild(sh);
    requestAnimationFrame(() => { const r = st.getBoundingClientRect(), sb = $('stage').getBoundingClientRect(); const sr = sw.getBoundingClientRect(), gp = parseFloat(getComputedStyle(box).getPropertyValue('--gap')) || 18; if(short && !two){ sw.style.left = (r.right - sb.left + gp) + 'px'; sw.style.top = (r.bottom - sb.top - sr.height) + 'px'; } else { sw.style.left = (r.left - sb.left + r.width / 2 - sr.width / 2) + 'px'; sw.style.top = Math.max(4, r.top - sb.top - sr.height - gp) + 'px'; }   /* 🕹️ bo-pz: a round 11 mm switch button, one gap from the stick */
      if(n === 0 && G && G.help && !box.querySelector('.hand')){ const h = document.createElement('div'); h.className = 'hand'; h.innerHTML = '👆<span>move!</span>'; h.style.left = (r.left - sb.left + r.width * 0.55) + 'px'; h.style.top = (r.top - sb.top + r.height * 0.2) + 'px'; box.appendChild(h); } });
  });
  if(window.matchMedia && matchMedia('(pointer:fine)').matches && !isTouch()) box.classList.add('kbd');
}

/* ---------- events → sounds, words, banners ---------- */
function banner(text, cls){ const b = $('banner'); b.textContent = text; b.className = 'banner on ' + (cls || ''); clearTimeout(banner.t); banner.t = setTimeout(() => b.classList.remove('on'), 2200); }
function bigWord(text){ if(!FX) return; const h = $('bigword-host'); h.innerHTML = ''; const e = document.createElement('div'); e.className = 'big-word'; e.textContent = text; h.appendChild(e); setTimeout(() => e.remove(), 1200); }
function floatAt(p, text){ if(!FX || !V) return; const f = V.P(p.x, p.y, 2.3); if(!f) return; const e = document.createElement('div'); e.className = 'float-tag'; e.textContent = text; e.style.left = f[0] + 'px'; e.style.top = f[1] + 'px'; $('float-host').appendChild(e); setTimeout(() => e.remove(), 1100); return e; }
const COACH = ['Pass to a friend who has space — the robots can\'t run as fast as the ball!', 'Shoot at the far corner — keepers find it hardest.', 'Hold K a little longer for a harder shot.', 'Shout Q / E when they shoot — your keeper will listen!', 'Use the 🔄 switch to pick the player nearest the ball.', 'Try Space, Space then K for a volley!'];
function isMine(side){ return G.humans.some(h => h.side === side); }
function handleEvents(evs){
  if(!evs.length) return;
  const M = G.M, P = i => M.players[i] || {};
  evs.forEach(e => {
    switch(e.k){
      case 'kickoff': sfx('whistle', 0.7); break;
      case 'pass': sfx('kick', 0.6); if(e.kind === 'heel' || e.kind === 'nolook') floatAt(P(e.by), BO.TRICKS[e.kind]); break;
      case 'shot': sfx('kick', 1); sfx('ooh', 0.5); if(e.volley) floatAt(P(e.by), '🎯 VOLLEY!'); break;
      case 'trick': floatAt(P(e.by), e.label); UISound.play('whoosh'); break;
      case 'trickfail': floatAt(P(e.by), e.name === 'nutmeg' ? '🦵 legs closed!' : '😵 lost it!'); break;
      case 'nutmeg': sfx('ooh', 0.9); bigWord('🥜 NUTMEG!'); if(e.point) banner('🥜 ' + (P(e.by).name || '?') + ' nutmegs ' + (P(e.on).name || '?') + ' — a point!', isMine(e.side) ? 'gold' : 'bad'); else floatAt(P(e.by), '🥜 through the legs!'); if(FX && isMine(e.side)) confetti(['🥜', '⭐', '✨'], 14); break;
      case 'wall': if(e.set){ if(isMine(1 - e.side)) banner('🧱 They make a wall — bend it round with L!', 'good'); } else sfx('thud', 0.35); break;
      case 'bturn': banner('🎤 ' + G.tn[e.side] + "'s turn — " + (e.human ? 'tricks ON the beat!' : 'watch the robot dance…'), e.side === 0 ? 'good' : ''); break;
      case 'bgo': bigWord('🎵 GO!'); G.brx = G.brx || [null, null]; G.brx[1 - e.side] = {a: 'bring', t: M.t}; break;
      case 'btrick': { if(e.grade === 'perfect' && (e.combo >= 3 || e.trick === 'neck' || e.trick === 'atw')){ G.brx = G.brx || [null, null]; G.brx[1 - e.side] = {a: 'wow', t: M.t}; }
        const pl = M.players.find(p => p.side === e.side && p.ctrl >= 0) || M.players.filter(p => p.side === e.side && !p.gk).slice(-1)[0]; G.btFloat = G.btFloat || []; if(e.up && G.btFloat[e.side]) G.btFloat[e.side].remove();   /* 🎮 the first thumb's label makes way for the combo */
        UISound.play(e.grade === 'perfect' ? 'success' : 'tap'); G.btFloat[e.side] = floatAt(pl, (e.grade === 'perfect' ? '✨ ' : '👍 ') + e.label + ' +' + e.pts); if(e.key && e.key.indexOf('+') > 0){ banner('🎮 COMBO · ' + e.label + ' +' + e.pts, 'gold'); sfx('ooh', 0.6);   /* a small chip at the top — the move itself stays in view */ } break; }
      case 'bmiss': G.brx = G.brx || [null, null]; if(!G.brx[1 - e.side] || M.t - G.brx[1 - e.side].t > 1.2) G.brx[1 - e.side] = {a: 'laugh', t: M.t}; if(M.ctrls.some(c => c.side === e.side)) floatAt(M.players.find(p => p.side === e.side && p.ctrl >= 0) || {}, '❌ ' + (e.why || 'off beat')); break;
      case 'bcards': sfx('ooh', 0.7); banner('🃏 Judges: ' + e.cards.join(' · ') + ' = ' + e.total + ' for ' + G.tn[e.side], 'gold'); break;
      case 'bround': bigWord('🏆 ' + G.tn[e.winner] + ' wins round ' + e.round + '!'); if(FX && isMine(e.winner)) confetti(['🎵', '⭐', '✨'], 16); break;
      case 'drill': banner(e.name + ' — ' + e.about, 'good'); say(e.name.replace(/^\S+\s/, '')); break;
      case 'drillhit': UISound.play('success'); bigWord({target: '🎯 HIT!', bar: '✖️ CROSSBAR!', goal: '⚽ GOAL!', pass: '✅ GOT IT!'}[e.what] || '⭐'); if(FX) confetti(['⭐', '✨'], 10); break;
      case 'drillmiss': floatAt(M.players[M.ctrls[0].pi], '❌ ' + (e.why || 'miss')); break;
      case 'juggle': UISound.play('tap'); if(e.n % 5 === 0) floatAt(M.players[M.ctrls[0].pi], '🦶 ' + e.n + '!'); break;
      case 'conehit': sfx('thud', 0.6); floatAt(M.players[M.ctrls[0].pi], '🔶 +1.5 s'); break;
      case 'cross': UISound.play('pop'); break;
      case 'highball': floatAt(P(e.by), e.flip ? '🌀 over the head!' : '🎈 high ball!'); break;
      case 'wallblock': sfx('thud', 1); floatAt(P(e.by), '🧱 Blocked!'); break;
      case 'curve': UISound.play('tap'); floatAt(P(M.ctrls[e.ci].pi), e.v > 0 ? '↪️ bend' : e.v < 0 ? '↩️ bend' : '⬆️ straight'); break;
      case 'moment': if(M.ctrls[e.ci] && M.ctrls[e.ci].seat <= 1){ UISound.play('pop'); if(navigator.vibrate) try{ navigator.vibrate(15); }catch(err){} } break;
      case 'perfect': sfx('ooh', 0.8); bigWord('⚡ PERFECT!'); UISound.play('success'); break;
      case 'starfull': if(isMine(e.side)){ banner('🔥 Star meter full — your next shot is a BLAST!', 'gold'); say('Star power!'); } break;
      case 'blast': bigWord('🔥 BLAST!'); sfx('roar', 0.6); G.trail = []; break;
      case 'kickin': banner('🦶 Kick-in · ' + G.tn[e.side]); break;
      case 'tackle': if(e.ok){ sfx('thud', 0.8); floatAt(P(e.by), e.slide ? '🛝 Slide tackle!' : '🦶 Tackle!'); } else if(e.dodged) floatAt(P(e.from), '😎 dodged!'); break;
      case 'slide': UISound.play('whoosh'); break;
      case 'header': sfx('thud', 0.8); floatAt(P(e.by), '🤕 Header!'); break;
      case 'lift': floatAt(P(e.by), '⬆️ flick!'); break;
      case 'jump': break;
      case 'save': sfx('thud', 1); bigWord(e.kind === 'catch' ? '🧤 CAUGHT!' : '🧤 SAVED!'); if(e.shoutSave){ banner('📣 Great shout — your keeper dived the right way!', 'gold'); } break;
      case 'dive': if(e.shout && !e.right && isMine(e.side)) banner('📣 Oh no — the ball went the other way!', 'bad'); break;
      case 'shout': floatAt(P((BO.keeperOf(M, e.side) || {}).i), e.s > 0 ? '📣 this way!' : '📣 that way!'); break;
      case 'egg': banner('🥚 A dino egg is rolling across the pitch!', 'gold'); break;
      case 'eggbump': sfx('thud', 0.7); floatAt(M.ball, '🥚 boing!'); break;
      case 'power': bigWord('⚡ POWER SHOT!'); sfx('kick', 1); break;
      case 'bounce': if(e.party && G.party){ sfx('thud', 0.5); if(FX && Math.random() < 0.35) floatAt(M.ball, pickOne(['💥 boing!', '🎉 wheee!', '🌀 wild!'])); } break;
      case 'post': sfx('thud', 1); banner(e.bar ? '🥅 Off the crossbar!' : '🥅 Off the post!', 'gold'); break;
      case 'goal': {
        const by = P(e.by), mine = isMine(e.side); sfx('roar', 1); sfx('whistle', 0.5);
        if(e.kind === 'nutmeg'){ if(mine) say('Nutmeg!'); break; }
        bigWord(e.golden ? '⚡ GOLDEN GOAL!' : e.own ? 'OWN GOAL!' : 'GOOOAL!'); banner('⚽ ' + (e.own ? 'Own goal — ' : (by.name || '?') + ' scores' + (e.assist >= 0 ? ' (pass: ' + P(e.assist).name + ')' : '') + ' — ') + e.score[0] + '–' + e.score[1], mine ? 'gold' : 'bad');
        if(FX && G.party){ bigWord('💥 POP!'); confetti([BombSkins.popOf(G.party) || '🎉', '🎉', '🎊', '✨'], 30); } else if(FX && mine) confetti(['⚽', '🎉', '⭐', '🚀', '🏆'], 26);
        if(mine && !e.own) say('Goal! ' + (by.name || '')); break; }
      case 'foul': sfx('whistle', 0.8); banner('🚩 Foul by ' + P(e.by).name + ' — free kick', 'bad'); break;
      case 'card': banner('🟨 Yellow card — ' + P(e.by).name, 'bad'); break;
      case 'offside': sfx('whistle', 0.8); banner('🚩 Offside! ' + P(e.by).name + ' was past the last defender', 'bad'); break;
      case 'throwin': banner('🙌 Throw-in · ' + G.tn[e.side]); break;
      case 'corner': banner('🚩 Corner · ' + G.tn[e.side]); break;
      case 'goalkick': banner('🧤 Goal kick'); break;
      case 'free': banner('🟢 Free kick · ' + G.tn[e.side]); break;
      case 'askball': floatAt(P(e.by), '🙋 To me!'); sfx('kick', 0.4); break;
      case 'swap': { const me = M.players.find(p => p.ctrl >= 0), sv = G.view.mode; banner('🔁 Switch ends! You now attack ' + (sv === 'behind' ? 'the 🥅 at the top again' : me && BO.dirOf(me.side, M) > 0 ? 'to the right ▶' : '◀ to the left'), 'gold'); G.hintT = 0; break; }
      case 'half': sfx('whistle', 1); banner('⏸ Half time ' + e.score[0] + '–' + e.score[1] + ' · 💬 Coach: ' + pickOne(COACH), 'good'); break;
      case 'goldengoal': sfx('whistle', 1); bigWord('⚡ GOLDEN GOAL'); banner('⚡ It\'s level — the next goal wins!', 'gold'); break;
      case 'pens': sfx('whistle', 1); bigWord('🥅 PENALTIES!'); banner('🥅 Penalty shootout! ' + (isTouch() ? 'Kick 💥 when the 🎯 is where you want · in goal: tap ⬅️ / ➡️' : 'Kick K when the 🎯 is where you want · in goal: Q / E to dive'), 'gold'); break;
      case 'pen': banner((e.scored ? '⚽ Scored! ' : '🧤 Missed! ') + 'Penalties ' + e.g[0] + '–' + e.g[1], e.scored === isMine(e.side) ? 'good' : 'bad'); break;
      case 'end': sfx('whistle', 1); setTimeout(() => sfx('whistle', 1), 260); break;
    }
  });
  GameComic._feed(evs);
}
function confetti(list, count){ for(let i = 0; i < (count || 24); i++){ const e = document.createElement('div'); e.className = 'confetti'; e.textContent = pickOne(list); e.style.left = Math.random() * 100 + 'vw'; e.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; e.style.animationDelay = (Math.random() * .5) + 's'; document.body.appendChild(e); setTimeout(() => e.remove(), 3800); } }

/* ---------- result + saving ---------- */
function finishMatch(){
  if(G.M.drill){ finishDrill(); return; }
  const M = G.M; G.over = true; ['goal-line', 'kb-hint', 'shout-kb', 'moment', 'sp-hint'].forEach(id => $(id).classList.add('hidden'));
  const secs = Math.max(1, Math.round((performance.now() - G.startAt) / 1000)), win = M.winner, vsRobot = G.mode !== 'duo';
  const mySide = G.humans[0].side, myWin = win === mySide, draw = win < 0, gd = M.score[mySide] - M.score[1 - mySide];
  const pensTxt = M.pens ? ' (pens ' + M.pens.g[0] + '–' + M.pens.g[1] + ')' : '';
  const stars = myWin ? (gd >= 3 ? 3 : gd >= 2 ? 2 : 1) : 0;
  const statsOf = side => { const ps = M.players.filter(p => p.side === side); const sum = k => ps.reduce((a, p) => a + (p.g[k] || 0), 0); return {goals: M.score[side], tricks: sum('tricks'), volleys: sum('volleys'), tackles: sum('tackles'), headers: sum('headers')}; };
  const scoreFor = h => { if(M.battle){ const B = M.battle; return B.hist.reduce((a, r) => a + r.score[h.side] * 100 + r.pts[h.side], 0) + (win === h.side ? 500 : 0); } const p = M.players.find(q => q.name === h.name && q.side === h.side) || {g: {}}, won = win === h.side, d = M.score[h.side] - M.score[1 - h.side];
    return Math.round(((p.g.goals || 0) * 400 + (p.g.assists || 0) * 150 + (p.g.tricks || 0) * 40 + (p.g.volleys || 0) * 120 + (p.g.shoutSaves || 0) * 150 + (p.g.tackles || 0) * 30 + (p.g.nutmegs || 0) * 150 + (p.ctrl >= 0 && M.ctrls[p.ctrl] ? M.ctrls[p.ctrl].perfects * 80 + M.ctrls[p.ctrl].blasts * 120 : 0) + M.score[h.side] * 100 + (won ? 1000 : 0) + Math.max(0, d) * 250) * (M.L.hardcore ? 3 : 1)); };
  if(FX && myWin) confetti(['⚽', '🏆', '⭐', '🚀', '🎉'], 34);
  UISound.play(myWin ? 'success' : draw ? 'pop' : 'error');
  const head = G.mode === 'duo' ? (draw ? '<div class="big">🤝</div><h2>A draw!</h2>' : '<div class="big">👑</div><h2 class="cheer">' + UI.esc(G.tn[win]) + ' win' + pensTxt + '!</h2>')
    : myWin ? '<div class="big">🏆</div><h2 class="cheer">You beat the ' + UI.esc(G.tn[1 - mySide]) + '!' + pensTxt + '</h2>' : draw ? '<div class="big">🤝</div><h2>A draw — so close!</h2>'
    : '<div class="big">' + (M.hcLost ? '💀' : '🤖') + '</div><h2>' + (M.hcLost ? '3 goals behind — game over' : 'The robots win this time' + pensTxt) + '</h2>';
  const me = M.players.find(p => p.name === G.humans[0].name && p.side === mySide) || {g: {}}, myScore = scoreFor(G.humans[0]);
  const tip = myWin ? '' : '<div class="note">💡 ' + pickOne(COACH) + '</div>';
  const next = myWin && G.level < 5 && G.mode !== 'duo';
  showResult(head + '<div class="score-big">' + M.score[0] + ' – ' + M.score[1] + '</div>' +
    (vsRobot && myWin ? '<div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= stars ? '' : ' off') + '" style="animation-delay:' + (i * 0.15) + 's">⭐</span>').join('') + '</div>' : '') +
    '<div class="stats"><span>🏆 ' + myScore.toLocaleString() + '</span><span>⚽ ' + (me.g.goals || 0) + ' goals</span><span>🅰️ ' + (me.g.assists || 0) + ' assists</span><span>🌀 ' + (me.g.tricks || 0) + ' tricks</span><span>🎯 ' + (me.g.volleys || 0) + ' volleys</span>' + (G.Sz.nokeeper ? '<span>🥜 ' + (me.g.nutmegs || 0) + ' nutmegs</span>' : '<span>📣 ' + (me.g.shoutSaves || 0) + ' shout saves</span>') + (me.ctrl >= 0 && M.ctrls[me.ctrl] ? '<span>⚡ ' + M.ctrls[me.ctrl].perfects + ' perfect</span><span>🔥 ' + M.ctrls[me.ctrl].blasts + ' blasts</span>' : '') + '<span>⏱ ' + fmt(secs) + '</span></div>' +
    tip + '<div class="comic-strip-slot" id="comic-strip-slot"></div><div class="save-note" id="save-note">' + (G.humans.some(h => h.name !== 'Guest') ? '💾 Saving…' : '') + '</div>' +
    '<div class="res-btns"><button class="btn soft sp-btn sp-secondary" id="btn-levels" data-sound="none" onclick="backToMenu()">🎚️ Levels</button><button class="btn sp-btn sp-primary" data-sound="pop" onclick="startMatch()">🔁 Play again</button>' + (next ? '<button class="btn sp-btn sp-primary" id="btn-next" data-sound="pop" onclick="nextLevel()">Next level ▶</button>' : '') + '</div>');
  if(G.cup) cupAfterMatch(M, mySide);   // 🏆 R4a: record it, play out the round, the card gets "🏆 Back to the cup"
  NOTES.length = 0;
  G.humans.forEach((h, seat) => {
    if(h.name === 'Guest') return;
    const p = M.players.find(q => q.name === h.name && q.side === h.side) || {g: {}}, won = win === h.side, conceded = M.score[1 - h.side];
    const stats = {matches: 1, wins: won ? 1 : 0, goals: p.g.goals || 0, assists: p.g.assists || 0, tricks: p.g.tricks || 0, volleys: p.g.volleys || 0, tackles: p.g.tackles || 0, shoutSaves: p.g.shoutSaves || 0, headers: p.g.headers || 0, nutmegs: p.g.nutmegs || 0, perfects: p.ctrl >= 0 && M.ctrls[p.ctrl] ? M.ctrls[p.ctrl].perfects : 0, blasts: p.ctrl >= 0 && M.ctrls[p.ctrl] ? M.ctrls[p.ctrl].blasts : 0, cleanSheets: conceded === 0 && (won || win < 0) ? 1 : 0, bestGoals: p.g.goals || 0};
    if(G.kind === 'party') stats.win_party = won ? 1 : 0; else if(G.kind === 'shootout') stats.win_pens = won ? 1 : 0; else if(G.kind === 'battle') stats.win_battle = won ? 1 : 0; else stats['win_' + G.size + 'v' + G.size] = won ? 1 : 0;
    if(vsRobot) saveWin(h.name, G.level, {score: scoreFor(h), stars: won ? (h.side === mySide ? stars : 1) : 0, cleared: won, timeSec: secs, theme: (G.kind === 'party' ? 'Party ball' : G.kind === 'shootout' ? 'Penalty shootout' : G.kind === 'battle' ? 'Tricks Battle' : SZ_NAME[G.size]) + ' · ' + LOOKS[G.theme].name, stats}, seat);
    else saveFeatsOnly(h.name, stats, seat);
  });
}
// 🎯 a skill challenge ends: ⭐ by score (or time on the cones), best kept per drill + level on this device, feats to the server
function finishDrill(){
  const M = G.M, d = M.drill, D = BO.DRILLS[d.id], st = d.stars || 0; G.over = true; ['goal-line', 'kb-hint', 'shout-kb', 'moment', 'sp-hint'].forEach(id => $(id).classList.add('hidden'));
  const old = drillBest(d.id, G.level), better = !old || st > old.stars || (st === old.stars && (D.time ? d.time != null && (!old.time || d.time < old.time) : d.score > (old.score || 0)));
  if(better) try{ localStorage.setItem(store('drill:' + d.id + ':' + G.level), JSON.stringify({stars: st, score: d.score, time: d.time || 0})); }catch(e){}
  if(FX && st) confetti(['⭐', '🎯', '✨'], 12 + st * 8); UISound.play(st ? 'success' : 'error');
  const val = D.time ? (d.time != null ? d.time + ' s' : '⏱ out of time') : d.score + (D.balls ? ' / ' + D.balls : '');
  showResult('<div class="big">' + (st === 3 ? '🏆' : st ? '🎯' : '💪') + '</div><h2' + (st ? ' class="cheer"' : '') + '>' + D.name + (st === 3 ? ' — perfect!' : st ? ' — well done!' : ' — try again!') + '</h2>' +
    '<div class="score-big">' + val + '</div><div class="rating">' + [1, 2, 3].map(i => '<span class="st' + (i <= st ? '' : ' off') + '" style="animation-delay:' + (i * 0.15) + 's">⭐</span>').join('') + '</div>' +
    '<div class="stats"><span>' + (better && st ? '🆕 new best!' : old ? 'best ' + '⭐'.repeat(old.stars) + (old.time ? ' · ' + old.time + ' s' : '') : 'first try') + '</span>' + (D.time ? '<span>⭐ ' + BO.CONE_STARS[G.level].join(' / ') + ' s</span>' : '<span>⭐ ' + D.stars.join(' / ') + '</span>') + '</div>' +
    '<div class="comic-strip-slot" id="comic-strip-slot"></div><div class="save-note" id="save-note"></div>' +
    '<div class="res-btns"><button class="btn soft sp-btn sp-secondary" id="btn-levels" data-sound="none" onclick="backToMenu()">🎚️ Levels</button><button class="btn soft sp-btn sp-secondary" data-sound="tap" onclick="hideResult(); if(G) cancelAnimationFrame(G.raf); G = null; openSetup(SET.level)">🎯 Other challenge</button><button class="btn sp-btn sp-primary" data-sound="pop" onclick="startMatch()">🔁 Again</button></div>');
  NOTES.length = 0;
  if(S.player !== 'Guest') saveFeatsOnly(S.player, {skills: 1, skillStars: better && old ? Math.max(0, st - old.stars) : better ? st : 0, juggles: d.id === 'juggle' ? d.score : 0}, 0);
}
function nextLevel(){ const n = Math.min(5, G ? G.level + 1 : SET.level + 1); if(!canPlay(n)){ backToMenu(); return; } hideResult(); if(G) cancelAnimationFrame(G.raf); G = null; openSetup(n); }
const PENDING_KEY = 'sp_blasoff_pending';
const NOTES = [];
function readPending(){ try{ return JSON.parse(localStorage.getItem(PENDING_KEY) || '[]'); }catch(e){ return []; } }
function writePending(list){ try{ localStorage.setItem(PENDING_KEY, JSON.stringify(list.slice(-20))); }catch(e){} }
function flushPending(){ const list = readPending(); if(!list.length) return; writePending([]); list.forEach(w => { const r = google.script.run.withFailureHandler(() => writePending(readPending().concat([w]))); if(w.feats) r.saveFeats(w.name, GAME_ID, w.stats); else r.saveLevelResult(GAME_ID, w.name, w.lvl, w.extra); }); }
function putNote(i, html){ NOTES[i] = html; const n = $('save-note'); if(n) n.innerHTML = NOTES.filter(Boolean).join('<br>'); }
function saveWin(name, lvlIdx, extra, seat, tries){
  tries = tries || 0; const p = S.progress[name] || (S.progress[name] = {unlocked: 0, tokens: [], best: []});
  const who = G && G.humans.length > 1 ? UI.esc(name) + ': ' : '';
  google.script.run.withSuccessHandler(res => {
      const best = (p.best || []).slice(); if(res.best) best[lvlIdx] = res.best;
      S.progress[name] = {unlocked: res.unlocked, tokens: res.tokens, best}; flushPending(); putNote(seat, who + saveText(res, extra.cleared));
      if(G && G.over){ const nb = $('btn-next'); if(nb && !canPlay(Math.min(5, lvlIdx + 1))) nb.remove(); }
    }).withFailureHandler(() => {
      if(tries < 1){ setTimeout(() => saveWin(name, lvlIdx, extra, seat, tries + 1), 1200); return; }
      writePending(readPending().concat([{name, lvl: lvlIdx, extra}])); putNote(seat, who + '⚠️ Could not save yet — it will be sent again next time.');
    }).saveLevelResult(GAME_ID, name, lvlIdx, extra);
}
function saveFeatsOnly(name, stats, seat){
  const who = UI.esc(name) + ': ';
  google.script.run.withSuccessHandler(res => putNote(seat, who + featText(res, '✅ Feats saved')))
    .withFailureHandler(() => { writePending(readPending().concat([{name, feats: true, stats}])); putNote(seat, who + '⚠️ Will be sent next time.'); }).saveFeats(name, GAME_ID, stats);
}
function featText(fe, base){ let h = base || ''; if(fe){ (fe.newTitles || []).forEach(t => { h += '<br><span class="title-new">🏷️ New title: ' + t.icon + ' ' + UI.esc(t.name) + '</span>'; }); (fe.newBadges || []).forEach(b => { h += '<br><span class="feat-new">' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) + ' · ' + b.tierName + '</span>'; }); } return h; }
function saveText(res, cleared){
  const h = res.newBadge ? '<span class="new-badge">🏅 New badge: ' + UI.esc(res.newBadge) + '</span>' : res.newHighScore && !res.firstTime ? '🎉 New high score!' : cleared ? (res.best && res.best.score ? 'Best: 🏆 ' + Number(res.best.score).toLocaleString() : '✅ Saved') : '✅ Feats saved — win to unlock the next level';
  return featText(res.feats, h);
}
function showResult(html){ const bk = G && BADGE_OF[G.kind === 'match' ? SZ_ID[G.size] : G.kind]; $('result-card').innerHTML = (bk ? logoImg(bk, 46, 'bo-rbadge', '') : '') + html; $('result').classList.remove('hidden'); }
function hideResult(){ $('result').classList.add('hidden'); }
function sessionQuery(){ let q = ''; if(S.player || CURRENT_PLAYER) q += '&player=' + encodeURIComponent(S.player || CURRENT_PLAYER); if(SESSION_START) q += '&sessionStart=' + SESSION_START; if(DURATION_MIN) q += '&durationMin=' + DURATION_MIN; return q; }
function goGameroom(){ UI.back(WEBAPP_URL + '?page=gameroom' + sessionQuery(), 'rooms'); }
window.feedbackContext = () => ({page: 'BlasOff', game: GAME_ID, level: G ? G.level : SET.level});

/* 💥📣 ROOM FOR COMICS + THE CROWD (bo-1) — the 💥 Comics chat / 📣 Cheer chat wire their kits here; this game draws no comics / crowd itself.
   GameComic.mode()        → 'fours' (4v4) | 'sevens' (7v7) | ''  (the live match)
   GameComic.hold(on)      → quietly freeze / unfreeze the match (no pause card; drawing goes on)
   GameComic.listen(fn)    → fn(mode, event, M) for every engine event (BO.takeEvents → handleEvents) — names in plan §19:
                             kickoff · pass {by, to, kind ground|long|heel|nolook} · shot {by, kind shot|chip|rabona|bicycle|header, power, volley} · trick {by, name, label} · trickfail ·
                             tackle {by, from, ok, slide, dodged} · slide · header · lift · volley · jump · dive {by keeper, side, dir, shout, right} · shout {side, s} · save {by, side, kind catch|parry, shout, right, shoutSave} ·
                             post {bar} · goal {side, by, assist, own, kind, score, golden} · foul · card · offside · throwin · corner · goalkick · free · claim · win · control · switch · call ·
                             half {score} · goldengoal · pens · pen {side, scored, g} · pengoal · penmiss · end {winner, score, pens, hcLost}
   GameComic.log()         → this match's events [{t, k, …}] (last 600) — strips come from what really happened
   GameComic.area()        → the play-area element (#stage) · GameComic.free() → the parts of the stage with no controls / bar (for side strips / the crowd)
   GameComic.view()        → the live camera: {P(x, y, z) → [px, py], sc(x, y, z), mode} — to draw on the pitch (fans sit on the stands: y = ±(Wh + 6 … 16), z 1 … 8)
   slots: #comics-slot-setup, #cheer-slot-setup (setup ⚙️ Extras row) · #comic-strip-slot (result card) */
const GameComic = {
  _fns: [], _log: [],
  mode(){ return G && !G.over ? (G.kind !== 'match' ? G.kind : SZ_ID[G.size]) : ''; },
  hold(on){ if(!G || G.over) return false; G.hold = !!on; if(!on) G.last = performance.now(); return true; },
  listen(fn){ this._fns.push(fn); return () => { this._fns = this._fns.filter(f => f !== fn); }; },
  log(){ return this._log.slice(); },
  area(){ return $('stage'); },
  view(){ return V ? {P: V.P, sc: V.sc, mode: G && G.view.mode} : null; },
  free(){ const st = $('stage').getBoundingClientRect(), taken = [...document.querySelectorAll('#pads .stick, #pads .btnpad, #pads .swbtn')].map(e => e.getBoundingClientRect()).filter(r => r.width);
    const rows = [{left: st.left, top: st.top, right: st.right, bottom: st.top + st.height * 0.3}]; return rows.map(r => { taken.forEach(t => { if(t.top < r.bottom && t.bottom > r.top && t.left < r.right && t.right > r.left){ if(t.left - r.left > r.right - t.right) r.right = t.left - 4; else r.left = t.right + 4; } }); return {left: Math.round(r.left), top: Math.round(r.top), width: Math.round(r.right - r.left), height: Math.round(r.bottom - r.top)}; }).filter(r => r.width >= 60 && r.height >= 40); },
  _reset(){ this._log = []; },
  _feed(list){ if(!list || !list.length || !G) return; const M = G.M, md = SZ_ID[G.size]; list.forEach(e => { this._log.push(e); this._fns.forEach(f => { try{ f(md, e, M); }catch(err){} }); }); if(this._log.length > 600) this._log.splice(0, this._log.length - 600); }
};
window.GameComic = GameComic;

/* ================= BOOT ================= */
function boot(){
  UI.loading('blasoff');
  google.script.run.withSuccessHandler(d => {
      UI.loaded();
      S.players = d.players || []; S.progress = d.progress || {}; S.settings = d.settings || {}; S.avatars = d.avatars || {}; S.ballSkins = d.ballSkins || {};
      UISound.applySettings(S.settings);
      const lockOn = !(S.settings.ScreenTimeLockEnabled === 'FALSE' || S.settings.ScreenTimeLockEnabled === false);
      lockHandle = UI.screenTimeLock({sessionStart: SESSION_START, durationMin: DURATION_MIN, enabled: lockOn, homeUrl: WEBAPP_URL + '?page=home', onLock: pauseGame});
      flushPending();
      if(CURRENT_PLAYER && S.players.some(p => p.Name === CURRENT_PLAYER)) choosePlayer(CURRENT_PLAYER); else { renderPlayers(); showScreen('player'); }
    }).withFailureHandler(() => { UI.loaded(); UI.toast('Could not load players — check the connection', 'err'); renderPlayers(); showScreen('player'); })
    .getLevelGameData(GAME_ID, CURRENT_PLAYER);
}
boot();
/* ✨ MODE SPOTLIGHT: ?mode=<id> opens this game straight in that mode after the player pick · "✨ Also try" on the start page · started modes → UI.modeTried */
const MS_GAME = 'blasoff';
function msOpen(id){ if(!ID_SZ[id] && !KINDS.includes(id)) return; setKind(id); savePrefs(); markModes(); renderLevels(); const b = document.querySelector('#mode-list .ui-mbtn.on'); if(b && b.scrollIntoView) b.scrollIntoView({block: 'nearest'}); }
function msNow(){ return modeId(); }
function msWrap(fn, idOf){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ try{ const id = idOf.apply(this, arguments); if(id && UI.modeTried) UI.modeTried(S.player || CURRENT_PLAYER, MS_GAME, id); }catch(e){} return f.apply(this, arguments); }; }
function msAfter(fn, after){ const f = window[fn]; if(typeof f !== 'function') return; window[fn] = function(){ const r = f.apply(this, arguments); try{ after.apply(this, arguments); }catch(e){} return r; }; }
msWrap('startMatch', () => modeId());
msAfter('choosePlayer', name => {
  if(!window.UI || !UI.modeLink) return;
  const id = UI.modeLink(MODE_LINK); if(id) msOpen(id);
  UI.alsoTry({game: MS_GAME, player: name, current: msNow, at: () => document.querySelector('#scr-menu .title'), open: msOpen});
});
/* ✨ END MODE SPOTLIGHT */
