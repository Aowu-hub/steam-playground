
const WEBAPP_URL = SP_TV[0];
const CURRENT_PLAYER = SP_TV[1]; window.SP_PAGE = SP_TV[2];

/* ---------- LOOK: the player's own theme ---------- */
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER));
function applyLook(settings){ const k = UI.applyTheme(UI.themeFor(settings, CURRENT_PLAYER)); UI.rememberTheme(CURRENT_PLAYER, k); }

const NAV_KIND = {home:'home', gameroom:'rooms', achievements:'trophy', setup:'admin', room:'room', collection:'collection'};
function goNav(page){
  UI.go(WEBAPP_URL + '?page=' + page + (CURRENT_PLAYER ? '&player=' + encodeURIComponent(CURRENT_PLAYER) : ''), NAV_KIND[page] || 'nav');
}

// One call for the ranking + settings; the list area shows its own loader.
function loadAchievements(){
  const box = document.getElementById('rank-list');
  box.style.minHeight = '140px';
  const close = UI.section(box, 'trophy', 'Counting badges');
  google.script.run
    .withSuccessHandler(d=>{ close(); box.style.minHeight = ''; applyLook(d.settings); UISound.applySettings(d.settings); TITLES = d.titles || {players: {}, meta: []}; renderList(d.leaderboard || [], d.bests || {}); PCOL = {}; (d.players || []).forEach((n, i) => { PCOL[n] = PLAYER_COLS[i % PLAYER_COLS.length]; }); renderRecent(d.recentScores || []); renderRecords(d.boards || {}, d.players || []); })
    .withFailureHandler(()=>{ close(); box.style.minHeight = ''; renderList([]); UI.toast('Could not load the archive — try again', 'err'); })
    .getAchievementsData(CURRENT_PLAYER);
}

const LEVEL_NAMES = ['Basic', 'Junior', 'Intermediate', 'Hard', 'Extreme', 'Hardcore'];
const LEVEL_ICONS = ['🌱', '🐣', '🔦', '⚡', '🌋', '💀'];
const GAME_LABEL = {'pokadif-case': '📖 Pokadif Cases', 'pokadif-arcade': '⏱️ Pokadif Arcade', 'sciencetory': '🔬 Sciencetory', 'pokadif': '🔍 Pokadif', 'blasoff': '⚽ BlasOff', 'pyraspike': '🔥 PyraDive', 'td-draprincess': '🐉👑 Dra-Princess Diary', 'artifactory': '🏭 Artifactory', 'georead': '🔤 GeoRead', 'geoscout': '🔢 GeoScout', 'beat-piano': '🎹 BeatCorner Piano', 'beat-drums': '🥁 BeatCorner Drums', 'brawenture': '🗺️ Brawenture', 'wisdeck': '🃏🧠 WisDeck Quiz', 'wiscount': '🃏🔢 WisCount', 'wisjack': '🃏🂡 WisJack', 'eyes-brain': '👀🧠 Eyes Brain Riot', 'polyplot': '⬛ Polyplot', 'soul-bopper': '👻💣 Soul Bopper', 'snakeast': '🍎 Snakize Snakeast', 'snakigate': '🧭 Snakize Snakigate', 'snakastle': '🏰 Snakize Snakastle', 'snaketale': '📜 Snakize Snaketale', 'alignext': '🔴 Alignext Drop', 'omnifile': '❌⭕ Alignext Omnifile', 'brawl-buddies': '🥊 Brawl Buddies', 'pose-party': '📷 Pose Party', 'sla-brall': '🏓 SlaBrall', 'beat-corner': '🎵 BeatCorner', 'sweet-swap': '🍬 Sweet Swap', 'word-board': '🔤 Lettercraft', 'number-board': '➗ Algebros', 'double-up': '🔀 Double Up', 'block-drop': '🧱 Block Drop', 'pop-blocks': '🫧 Pop Blocks', 'number-grid': '🔢 Digitinct', 'math-quest': '🧮 Math Quest', 'maze': '🧭 Maze', 'stacking-sim': '🏗️ Stack It!', 'robot-adventure': '🤖 Code the Robot', 'checkers': '🔴 Checkers', 'chess': '♞ Chess', 'pinball': '🎯 Pinball', 'hopper': '🐸 Dodgy Hopper', 'turbo': '🏎️ Turbo Trail', 'memory': '🃏 Memory Match', 'color-match': '🎨 Color Match', 'count-match': '🔢 Count & Match', 'code-robot': '🤖 Mini Robot', 'trash-pointer': '🗑️ Trash Pointer'};
// Records: one row per game (top 3 per level, gold / silver / bronze), mini games included.
const REC_TABS = [
  {id: 'td-draprincess', label: '🐉👑 Dra-Princess Diary', score: true},
  {id: 'maze', label: '🧭 Maze', score: false},
  {id: 'stacking-sim', label: '🏗️ Stack It!', score: true},
  {id: 'robot-adventure', label: '🤖 Code the Robot', score: true},
  {id: 'checkers', label: '🔴 Checkers', score: true},
  {id: 'chess', label: '♞ Chess', score: true},
  {id: 'pinball', label: '🎯 Pinball', score: true},
  {id: 'hopper', label: '🐸 Dodgy Hopper', score: true},
  {id: 'turbo', label: '🏎️ Turbo Trail', score: true},
  {id: 'memory', label: '🃏 Memory Match', score: true},
  {id: 'math-quest', label: '🧮 Math Quest', score: true},
  {id: 'double-up', label: '🔀 Double Up', score: true},
  {id: 'number-board', label: '➗ Algebros', score: true},
  {id: 'word-board', label: '🔤 Lettercraft', score: true},
  {id: 'sweet-swap', label: '🍬 Sweet Swap', score: true},
  {id: 'beat-corner', label: '🎵 BeatCorner', score: true},
  {id: 'beat-piano', label: '🎹 BeatCorner Piano', score: true},
  {id: 'beat-drums', label: '🥁 BeatCorner Drums', score: true},
  {id: 'sla-brall', label: '🏓 SlaBrall', score: true},
  {id: 'blasoff', label: '⚽ BlasOff', score: true},   // ⚽ bo-1
  {id: 'brawl-buddies', label: '🥊 Brawl Buddies', score: true},
  {id: 'brawenture', label: '🗺️ Brawenture', score: true},
  {id: 'soul-bopper', label: '👻💣 Soul Bopper', score: true},
  {id: 'sciencetory', label: '🔬 Sciencetory', score: true},
  {id: 'pokadif', label: '🔍 Pokadif', score: true},
  {id: 'pokadif-arcade', label: '⏱️ Pokadif Arcade', score: true},
  {id: 'pokadif-case', label: '📖 Pokadif Cases', score: true},
  {id: 'pyraspike', label: '🔥 PyraDive', score: true},
  {id: 'polyplot', label: '⬛ Polyplot', score: true},
  {id: 'eyes-brain', label: '👀🧠 Eyes Brain Riot', score: true},
  {id: 'georead', label: '🔤 GeoRead', score: true},
  {id: 'geoscout', label: '🔢 GeoScout', score: true},
  {id: 'artifactory', label: '🏭 Artifactory', score: true},
  {id: 'wisdeck', label: '🃏🧠 WisDeck Quiz', score: true},
  {id: 'wiscount', label: '🃏🔢 WisCount', score: true},
  {id: 'wisjack', label: '🃏🂡 WisJack', score: true},
  {id: 'alignext', label: '🔴 Alignext Drop', score: true},
  {id: 'omnifile', label: '❌⭕ Alignext Omnifile', score: true},
  {id: 'snakeast', label: '🍎 Snakize Snakeast', score: true},
  {id: 'snakigate', label: '🧭 Snakize Snakigate', score: true},
  {id: 'snakastle', label: '🏰 Snakize Snakastle', score: true},
  {id: 'pose-party', label: '📷 Pose Party', score: true},
  {id: 'block-drop', label: '🧱 Block Drop', score: true},
  {id: 'pop-blocks', label: '🫧 Pop Blocks', score: true},
  {id: 'number-grid', label: '🔢 Digitinct', score: true}
];
const BOARD_ROWS = REC_TABS.map(t => t.id).concat(['color-match', 'count-match', 'code-robot', 'trash-pointer']);
const GAME_COLOR = {'pokadif-case': '#8E5BE8', 'pokadif-arcade': '#FF8A3D', 'sciencetory': '#2F6FDB', 'pokadif': '#4B3FD1', 'blasoff': '#2DBE6C', 'pyraspike': '#FF6B1A', 'td-draprincess': '#FF5C9A', 'artifactory': '#7C3AED', 'georead': '#2F6BEA', 'geoscout': '#14B8A6', 'beat-piano': '#3A86FF', 'beat-drums': '#E07A3F', 'brawenture': '#18B8A6', 'wisdeck': '#3D6BFF', 'wiscount': '#22A867', 'wisjack': '#E5484D', 'eyes-brain': '#FF4F9A', 'polyplot': '#2F8CFF', 'soul-bopper': '#7C4DFF', 'snakeast': '#2FB862', 'snakigate': '#18B8A6', 'snakastle': '#C2410C', 'snaketale': '#7A5CFA', 'alignext': '#E63946', 'omnifile': '#7B5CFA', 'brawl-buddies': '#FF4D6D', 'pose-party': '#FF4FA3', 'sla-brall': '#FF7A1A', 'beat-corner': '#7A5CFA', 'sweet-swap': '#FF4D8D', 'word-board': '#3D7DD8', 'number-board': '#E07A3F', 'double-up': '#F28C28', 'block-drop': '#3D8BFD', 'pop-blocks': '#FF4D8D', 'number-grid': '#7C6CF2', 'math-quest': '#3D7DD8', 'maze': '#2EC4B6', 'stacking-sim': '#FF9F1C', 'robot-adventure': '#4361EE', 'checkers': '#E63946', 'chess': '#6B3BE0', 'pinball': '#FF4D8D', 'hopper': '#5CC45A', 'turbo': '#FF7A1A', 'memory': '#9B5DE5', 'color-match': '#F72585', 'count-match': '#4CB963', 'code-robot': '#3A86FF', 'trash-pointer': '#8D6E63'};
const MINI_LEVELS = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5+'];
const PLAYER_COLS = ['#FF4D8D', '#2CA6DE', '#4CB963', '#FF9F1C', '#7B5FE0', '#E63946', '#2EC4B6', '#B5651D'];
let PCOL = {};
function fmtSec(s){ s = Math.max(0, Math.round(s)); return Math.floor(s / 60) + ':' + String(s % 60).padStart(2, '0'); }
function stars(n){ return '⭐'.repeat(n || 0); }
/* ---------- 🔎 detail cards: hover a node on a computer, tap it on a phone / tablet (plan 11t) ---------- */
const NODES = [];
function node(o){ NODES.push(o); return ' data-n="' + (NODES.length - 1) + '" tabindex="0"'; }
function cardRows(list){ return list.filter(x => x && x[1] !== '' && x[1] != null).map(([ic, v]) => '<div class="nc-row"><span>' + ic + '</span><b>' + v + '</b></div>').join(''); }
function nodeCard(o){
  if(o.k === 'rec' || o.k === 'log'){
    const r = o.r, g = o.g || r.game, lv = o.k === 'rec' ? o.lv : r.level, mini = o.k === 'rec' ? o.mini : isMini(g), t = chosenTitle(r.name);
    const lvName = mini ? (MINI_LEVELS[lv] || 'Stage ' + (lv + 1)) : (r.levelName || LEVEL_NAMES[lv] || ''), lvIc = mini ? '⭐' : (LEVEL_ICONS[lv] || '');
    const rank = o.k === 'rec' ? o.rank : r.rank;
    let card_ = '<div class="nc-head">' + dot(r.name) + '<b>' + UI.esc(r.name) + '</b>' + (t ? '<span class="nc-title">' + t.icon + ' ' + UI.esc(t.name) + '</span>' : '') + '</div>' +
      '<div class="nc-game">' + UI.esc(GAME_LABEL[g] || g) + ' · ' + lvIc + ' ' + UI.esc(lvName) + '</div>' +
      cardRows([[rank ? ['🥇', '🥈', '🥉'][rank - 1] || '#' + rank : '', rank ? (rank <= 3 ? ['1st', '2nd', '3rd'][rank - 1] : rank + 'th') + ' in the family' : ''],
        ['🏆', r.score ? Number(r.score).toLocaleString() + ' points' : ''], ['⏱', r.timeSec ? fmtSec(r.timeSec) : ''], ['⭐', r.stars ? stars(r.stars) : ''],
        ['🎨', r.theme && r.theme !== 'undefined' ? UI.esc(String(r.theme)) : ''], ['📅', r.date ? UI.esc(String(r.date)) : ''],
        ['🔁', o.k === 'rec' && r.tries ? (r.tries === 1 ? 'Done on the 1st try!' : 'Best of ' + r.tries + ' tries') : '']]) +
      (lv === 5 && !mini ? '<div class="nc-note">💀 Hardcore — points ×3, one life</div>' : '');
      if(o.ways && Object.keys(o.ways).length) card_ += '<div class="nc-game" style="margin-top:6px">🎮 Best per way to play</div>' + Object.keys(o.ways).map(w => { const x = o.ways[w]; return '<div class="nc-row"><span>' + UI.esc(w.split(' ')[0]) + '</span><b>' + UI.esc(w.split(' ').slice(1).join(' ')) + ' · ' + UI.esc(x.name) + ' 🏆 ' + Number(x.score || 0).toLocaleString() + ' ' + stars(x.stars) + '</b></div>'; }).join('');
      return card_;
  }
  if(o.k === 'feat'){
    const b = o.b, pct = b.next ? Math.max(0, Math.min(100, Math.round((Number(b.value) || 0) / b.next * 100))) : 100;
    return '<div class="nc-head"><span class="nc-big">' + (b.medal || '') + ' ' + b.icon + '</span><b>' + UI.esc(b.name) + '</b></div>' +
      '<div class="nc-game">' + UI.esc(FEAT_GAME[b.game] || b.game || '') + (b.tierName ? ' · ' + UI.esc(b.tierName) : '') + '</div>' +
      cardRows([['📊', (b.kind === 'max' ? 'Best: ' : b.kind === 'min' ? 'Fastest: ' : 'Total: ') + Number(b.value).toLocaleString() + (b.unit ? ' ' + UI.esc(b.unit) : '')],
        ['🎯', b.next ? 'Next medal at ' + Number(b.next).toLocaleString() + (b.unit ? ' ' + UI.esc(b.unit) : '') : 'Top medal — well done!']]) +
      (b.next && b.kind !== 'min' ? '<div class="nc-bar"><i style="width:' + pct + '%"></i></div><div class="nc-small">' + pct + '% of the way</div>' : '');
  }
  if(o.k === 'title'){
    const t = o.t; return '<div class="nc-head"><span class="nc-big">' + t.icon + '</span><b>' + UI.esc(t.name) + '</b></div><div class="nc-game">🏷️ Title</div>' +
      cardRows([['✅', UI.esc(t.hint || '')], ['👤', TITLES.players[o.name] && TITLES.players[o.name].chosen === t.id ? UI.esc(o.name) + ' wears it under the name' : 'Pick it on the Dashboard to show it under your name']]);
  }
  if(o.k === 'best'){
    const x = o.x; return '<div class="nc-head"><b>' + o.label + '</b></div><div class="nc-game">' + LEVEL_ICONS[o.lv] + ' ' + LEVEL_NAMES[o.lv] + ' — best result</div>' +
      cardRows([['🏆', x.score ? Number(x.score).toLocaleString() + ' points' : ''], ['⏱', x.timeSec ? fmtSec(x.timeSec) : ''], ['⭐', x.stars ? stars(x.stars) : '']]) +
      (o.lv === 5 ? '<div class="nc-note">💀 Hardcore — points ×3</div>' : '');
  }
  return '';
}
const NC = {el: null, pinned: false, card: null};
function ncCard(){ if(!NC.card){ NC.card = document.createElement('div'); NC.card.className = 'node-card hidden'; NC.card.id = 'node-card'; NC.card.setAttribute('role', 'tooltip'); document.body.appendChild(NC.card); } return NC.card; }
function showNode(el, pinned){
  const o = NODES[Number(el.dataset.n)]; if(!o) return; const c = ncCard();
  if(NC.el && NC.el !== el) NC.el.classList.remove('nc-on');
  NC.el = el; NC.pinned = !!pinned; el.classList.add('nc-on');
  c.innerHTML = nodeCard(o); c.classList.remove('hidden');
  const r = el.getBoundingClientRect(), vw = innerWidth, vh = innerHeight, w = Math.min(300, vw - 16); c.style.width = w + 'px';
  c.style.maxHeight = (vh - 16) + 'px';
  const h = c.offsetHeight, roomBelow = vh - r.bottom - 8, roomAbove = r.top - 8, below = h <= roomBelow || roomBelow >= roomAbove;
  c.style.left = Math.max(8, Math.min(vw - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  c.style.top = Math.max(8, Math.min(vh - h - 8, below ? r.bottom + 8 : r.top - 8 - h)) + 'px';   // always fully on screen
  c.classList.toggle('up', !below);
}
function hideNode(){ if(NC.el) NC.el.classList.remove('nc-on'); NC.el = null; NC.pinned = false; if(NC.card) NC.card.classList.add('hidden'); }
document.addEventListener('pointerover', e => { if(e.pointerType !== 'mouse' || NC.pinned) return; const el = e.target.closest('[data-n]'); if(el) showNode(el, false); });
document.addEventListener('pointerout', e => { if(e.pointerType !== 'mouse' || NC.pinned || !NC.el) return; const to = e.relatedTarget; if(!to || !NC.el.contains(to)) { const el = e.target.closest('[data-n]'); if(el === NC.el) hideNode(); } });
document.addEventListener('click', e => {   // tap (phone / tablet) = show; tap again or tap outside = hide
  const el = e.target.closest('[data-n]');
  if(el){ if(NC.el === el && NC.pinned) hideNode(); else showNode(el, true); return; }
  if(!e.target.closest('#node-card')) hideNode();
});
document.addEventListener('keydown', e => { if(e.key === 'Escape') hideNode(); if(e.key === 'Enter'){ const el = document.activeElement && document.activeElement.closest && document.activeElement.closest('[data-n]'); if(el) showNode(el, true); } });
window.addEventListener('scroll', () => { if(NC.el && !NC.pinned) hideNode(); else if(NC.el) showNode(NC.el, true); }, {passive: true});
window.addEventListener('resize', () => hideNode());
function isMini(g){ return ['color-match', 'count-match', 'code-robot', 'trash-pointer'].includes(g); }
function dot(n){ return '<i class="dot" style="background:' + (PCOL[n] || '#999') + '"></i>'; }
let BESTS = {};
// one short line per game: 🥇 leader on the hardest level anyone finished · your own best · how many finishes
function gameSummary(g, b){
  const mini = isMini(g), levels = (b && b.levels) || []; let lead = null, n = 0, me = null;
  levels.forEach((L, i) => { if(!L) return; n += (L.top || []).length + (L.more || 0); if(L.top && L.top.length) lead = {i, r: L.top[0]};
    (L.top || []).forEach((r, k) => { if(CURRENT_PLAYER && r.name === CURRENT_PLAYER) me = {i, r, rank: k + 1}; }); });
  const mine = CURRENT_PLAYER && BESTS[CURRENT_PLAYER] && BESTS[CURRENT_PLAYER][g];
  if(mine && mine.length){ for(let i = mine.length - 1; i >= 0; i--){ const x = mine[i]; if(x && (x.timeSec || x.score)){ if(!me || i > me.i) me = {i, r: x}; break; } } }
  const ic = i => mini ? '⭐' + (i + 1) : LEVEL_ICONS[i];
  const val = r => b && b.byScore ? (r.score ? '🏆 ' + Number(r.score).toLocaleString() : stars(r.stars)) : (r.timeSec ? '⏱ ' + fmtSec(r.timeSec) : stars(r.stars));
  let h = '';
  const meLead = lead && me && CURRENT_PLAYER && lead.r.name === CURRENT_PLAYER && me.i === lead.i;
  if(lead) h += '<span class="gs lead" title="family record on the hardest level">🥇 ' + dot(lead.r.name) + '<span class="nm">' + UI.esc(lead.r.name) + '</span>' + (meLead ? ' (you!)' : '') + ' ' + ic(lead.i) + ' ' + val(lead.r) + '</span>';
  if(me && CURRENT_PLAYER && !meLead) h += '<span class="gs me" title="your best">🙋 ' + ic(me.i) + ' ' + val(me.r) + (me.rank ? ' · ' + ['🥇', '🥈', '🥉'][me.rank - 1] : '') + '</span>';
  if(n) h += '<span class="gs n">' + n + ' finish' + (n === 1 ? '' : 'es') + '</span>';
  return h;
}
function openGame(el, on){
  if(on) document.querySelectorAll('#boards .grow.open').forEach(x => { if(x !== el) setGameOpen(x, false); });
  setGameOpen(el, on); hideNode();
  if(on){ const r = el.getBoundingClientRect(); if(r.top < 60 || r.top > innerHeight - 80) el.scrollIntoView({block: 'start', behavior: 'smooth'}); }
}
function setGameOpen(el, on){ el.classList.toggle('open', on); const h = el.querySelector('.grow-head'); if(h) h.setAttribute('aria-expanded', on ? 'true' : 'false'); syncAllBtn(); }
function syncAllBtn(){ const b = document.getElementById('rec-all'); if(!b) return; const all = document.querySelectorAll('#boards .grow.played'), open = document.querySelectorAll('#boards .grow.played.open');
  b.textContent = all.length && open.length === all.length ? 'Close all ▴' : 'Open all ▾'; b.parentNode.classList.toggle('hidden', all.length < 2); }
function toggleAllGames(){ const all = [...document.querySelectorAll('#boards .grow.played')], on = all.some(x => !x.classList.contains('open')); all.forEach(x => setGameOpen(x, on)); hideNode(); }
function renderRecords(boards, players){
  PCOL = {}; (players || []).forEach((n, i) => { PCOL[n] = PLAYER_COLS[i % PLAYER_COLS.length]; });
  document.getElementById('who-key').innerHTML = (players || []).map(n => '<span>' + dot(n) + UI.esc(n) + '</span>').join('');
  const played = [], unplayed = [];
  BOARD_ROWS.forEach(g => {
    const b = (boards || {})[g]; const levels = b ? b.levels : []; const any = levels.some(l => l && l.top && l.top.length);
    if(!any){ unplayed.push('<span class="grow unplayed" style="--gc:' + (GAME_COLOR[g] || '#999') + '" data-g="' + g + '">' + UI.esc(GAME_LABEL[g] || g) + '</span>'); return; }
    const sub = b.byScore ? 'top score per ' + (isMini(g) ? 'stage' : 'level') : 'fastest time per ' + (isMini(g) ? 'stage' : 'level');
    const body = '<div class="lvls' + (isMini(g) ? '' : ' six') + '">' + (isMini(g) ? [0, 1, 2, 3, 4] : [0, 1, 2, 3, 4, 5]).map(i => {
      const L = levels[i] || {top: [], more: 0}, nm = isMini(g) ? MINI_LEVELS[i] : LEVEL_NAMES[i];
      const lines = L.top.map((r, k) => {
        const medal = ['🥇', '🥈', '🥉'][k] || (k + 1) + '.';
        const val = b.byScore ? Number(r.score).toLocaleString() : (r.timeSec ? fmtSec(r.timeSec) : stars(r.stars));
        const extra = b.byScore && r.timeSec ? '<span class="tm">⏱' + fmtSec(r.timeSec) + '</span>' : '';
        return '<div class="pl r' + Math.min(k + 1, 4) + '"' + node({k: 'rec', g, lv: i, r, rank: k + 1, byScore: b.byScore, mini: isMini(g), ways: (b.levels[i] || {}).ways}) + '><div class="top">' + medal + ' ' + dot(r.name) + '<span class="nm">' + UI.esc(r.name) + '</span></div><div class="bot"><span class="v">' + val + '</span>' + extra + '</div></div>';
      }).join('');
      return '<div class="lvl"><div class="lh"><span class="ic">' + (isMini(g) ? '⭐' : LEVEL_ICONS[i]) + '</span>' + nm + '</div>' + (lines || '<div class="none">No one yet</div>') + (L.more ? '<div class="more">+' + L.more + ' more</div>' : '') + '</div>';
    }).join('') + '</div>';
    played.push('<div class="grow played" style="--gc:' + (GAME_COLOR[g] || '#999') + '" data-g="' + g + '"><div class="grow-head" role="button" tabindex="0" aria-expanded="false"><span class="gname">' + UI.esc(GAME_LABEL[g] || g) + '</span><span class="gsum">' + gameSummary(g, b) + '</span><span class="gchev">▸</span></div><div class="gbody"><div class="grow-sub"><small>' + sub + '</small></div>' + body + '</div></div>');
  });
  document.getElementById('boards').innerHTML = played.join('') + (unplayed.length ? '<div class="unplayed-box"><div class="ut">🚀 Not played yet — be the first! (' + unplayed.length + ')</div><div class="chips">' + unplayed.join('') + '</div></div>' : '');
  document.querySelectorAll('#boards .grow.played .grow-head').forEach(h => {
    const g = h.parentNode;
    h.addEventListener('click', e => { e.stopPropagation(); openGame(g, !g.classList.contains('open')); });
    h.addEventListener('keydown', e => { if(e.key === 'Enter' || e.key === ' '){ e.preventDefault(); openGame(g, !g.classList.contains('open')); } });
  });
  syncAllBtn();
  document.getElementById('maze-box').classList.remove('hidden');
}
function renderRecent(list){
  const box = document.getElementById('recent-log');
  list = (list || []).slice(0, 10);
  if(!list.length){ document.getElementById('recent-box').classList.add('hidden'); return; }
  box.innerHTML = list.map(r =>
    '<div class="log-row"' + node({k: 'log', r}) + ' style="--gc:' + (GAME_COLOR[r.game] || 'transparent') + '"><span class="when">' + UI.esc(String(r.date).slice(5)) + '</span>' +
    '<span class="what">' + dot(r.name) + ' ' + UI.esc(r.name) + ' · ' + UI.esc(GAME_LABEL[r.game] || r.game) + ' ' + UI.esc(r.levelName || LEVEL_NAMES[r.level] || '') + '</span>' +
    (r.rank ? '<span class="rk r' + r.rank + '">' + ['🥇 1st', '🥈 2nd', '🥉 3rd'][r.rank - 1] + '</span>' : '') +
    (r.score ? '<span class="t">🏆 ' + Number(r.score).toLocaleString() + '</span>' : '') + (r.timeSec ? '<span class="t">⏱ ' + fmtSec(r.timeSec) + '</span>' : '') + '<span>' + stars(r.stars) + '</span></div>').join('');
  document.getElementById('recent-box').classList.remove('hidden');
}
/* ---------- feats badges + titles ---------- */
let TITLES = {players: {}, meta: []};
function chosenTitle(n){ const p = TITLES.players[n]; return p && p.chosen ? TITLES.meta.find(t => t.id === p.chosen) : null; }
const FEAT_GAME = {'pokadif-case': '📖 Pokadif Cases', 'pokadif-arcade': '⏱️ Pokadif Arcade', 'sciencetory': '🔬 Sciencetory', 'pokadif': '🔍 Pokadif', 'blasoff': '⚽ BlasOff', 'pyraspike': '🔥 PyraDive', 'td-draprincess': '🏰 TD-Stories', 'artifactory': '🏭 Artifactory', 'georead': '🔤 GeoRead', 'geoscout': '🔢 GeoScout', 'beat-piano': '🎹 BeatCorner Piano', 'beat-drums': '🥁 BeatCorner Drums', 'brawenture': '🗺️ Brawenture', 'wisdeck': '🃏 WisDeck', 'eyes-brain': '👀🧠 Eyes Brain Riot', 'polyplot': '⬛ Polyplot', 'soul-bopper': '👻💣 Soul Bopper', 'snakeast': '🍎 Snakize Snakeast', 'snakigate': '🧭 Snakize Snakigate', 'snakastle': '🏰 Snakize Snakastle', 'snaketale': '📜 Snakize Snaketale', 'alignext': '🔴 Alignext Drop', 'omnifile': '❌⭕ Alignext Omnifile', 'brawl-buddies': '🥊 Brawl Buddies', 'pose-party': '📷 Pose Party', 'sla-brall': '🏓 SlaBrall', 'beat-corner': '🎵 BeatCorner', 'sweet-swap': '🍬 Sweet Swap', 'word-board': '🔤 Lettercraft', 'number-board': '➗ Algebros', 'double-up': '🔀 Double Up', 'block-drop': '🧱 Block Drop', 'pop-blocks': '🫧 Pop Blocks', 'number-grid': '🔢 Digitinct', 'math-quest': '🧮 Math Quest', checkers: '🔴 Checkers', chess: '♞ Chess', pinball: '🎯 Pinball', hopper: '🐸 Dodgy Hopper', turbo: '🏎️ Turbo Trail', memory: '🃏 Memory Match', workshop: '🔨 Furniture Workshop'};
function featsWall(name){
  const p = TITLES.players[name]; if(!p) return '';
  const titles = p.unlocked.map(id => TITLES.meta.find(t => t.id === id)).filter(Boolean);
  let h = '';
  if(titles.length) h += '<div class="badge-game">🏷️ Titles earned</div><div class="badge-chips">' + titles.map(t => '<span class="title-chip' + (p.chosen === t.id ? ' on' : '') + '"' + node({k: 'title', t, name}) + '>' + t.icon + ' ' + UI.esc(t.name) + '</span>').join('') + '</div>';
  const byGame = {};
  (p.badges || []).forEach(b => { (byGame[b.game] = byGame[b.game] || []).push(b); });
  Object.keys(byGame).forEach(g => {
    h += '<div class="badge-game">' + (FEAT_GAME[g] || g) + ' feats</div><div class="badge-chips">' + byGame[g].map(b =>
      '<span class="feat-chip t' + b.tier + '"' + node({k: 'feat', b, name}) + '>' + b.medal + ' ' + b.icon + ' ' + UI.esc(b.name) +
      ' <small>' + (b.kind === 'min' ? b.value + ' ' + b.unit : b.kind === 'max' ? 'best ' + Number(b.value).toLocaleString() : '×' + b.value) + '</small></span>').join('') + '</div>';
  });
  return h;
}
function bestHtml(b){
  // one line per game: the hardest level cleared with its time and best score
  const rows = REC_TABS.map(T => {
    const list = (b || {})[T.id] || [];
    const chips = list.map((x, li) => x && (x.timeSec || x.score) ? '<span class="time-chip"' + node({k: 'best', label: T.label, lv: li, x}) + '>' + LEVEL_ICONS[li] + ' ' + LEVEL_NAMES[li] + (x.score ? ' · 🏆 ' + Number(x.score).toLocaleString() : '') + (x.timeSec ? ' · ⏱ ' + fmtSec(x.timeSec) : '') + ' ' + stars(x.stars) + '</span>' : '').join('');
    return chips ? '<span class="g">' + T.label + '</span><div class="badge-chips">' + chips + '</div>' : '';
  }).join('');
  return rows ? '<div class="badge-game">Best results</div><div class="best-grid">' + rows + '</div>' : '';
}
function renderList(leaderboard, bests){
  bests = bests || {}; BESTS = bests;
  const box = document.getElementById('rank-list');
  box.innerHTML = '';
  document.getElementById('empty-msg').classList.toggle('hidden', leaderboard.length > 0);

  leaderboard.forEach((entry, i)=>{
    const rank = i + 1;
    const medal = rank===1 ? '🥇' : rank===2 ? '🥈' : rank===3 ? '🥉' : '';
    const topCls = rank<=3 ? ' top'+rank : '';

    const row = document.createElement('div');
    row.className = 'rank-row t-card' + topCls;
    row.innerHTML =
      (medal ? '<div class="rank-medal">'+medal+'</div>' : '<div class="rank-num">'+rank+'</div>') +
      '<div class="rank-avatar">'+UI.esc(entry.name ? entry.name.charAt(0).toUpperCase() : '?')+'</div>' +
      '<div class="rank-info"><div class="pname">'+UI.esc(entry.name)+'</div><div class="page">'+(chosenTitle(entry.name) ? '<span class="title-chip on">' + chosenTitle(entry.name).icon + ' ' + UI.esc(chosenTitle(entry.name).name) + '</span> ' : '')+UI.esc(entry.age||'')+'</div></div>' +
      '<div class="rank-tokens">'+UI.esc(entry.tokenCount)+' 🏅</div>' +
      '<div class="rank-chevron">▸</div>';

    const detail = document.createElement('div');
    const best = bestHtml(bests[entry.name]) + featsWall(entry.name);
    if((entry.gamesPlayed && entry.gamesPlayed.length) || best){
      detail.className = 'badge-detail';
      detail.innerHTML = (entry.gamesPlayed || []).map(g =>
        '<div class="badge-game">'+UI.esc(g.gameName)+'</div><div class="badge-chips">' +
        g.tokens.map(t => '<span class="badge-chip">🏅 '+UI.esc(t)+'</span>').join('') +
        '</div>'
      ).join('') + best;
    } else {
      detail.className = 'no-badges';
      detail.textContent = 'No badges yet.';
    }

    row.onclick = ()=>{
      row.classList.toggle('open');
      detail.classList.toggle('open');
    };

    box.appendChild(row);
    box.appendChild(detail);
  });
}

loadAchievements();
