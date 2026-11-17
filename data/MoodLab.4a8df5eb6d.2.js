
const CURRENT_PLAYER = SP_TV[0]; window.SP_PAGE = SP_TV[1];
UI.applyTheme(UI.cachedTheme(CURRENT_PLAYER), {kitOnly: true});
const $ = id => document.getElementById(id);
const GAME_OF = {mathquest: 'Math Quest', numbergrid: 'Digitinct', numberboard: 'Algebros', wordboard: 'Lettercraft', georead: 'GeoRead', geoscout: 'GeoScout', eyesbrain: 'Eyes Brain Riot',
  memory: 'Memory / Memories Match', wisdeck: 'WisDeck', sweetswap: 'Sweet Swap', robotadventure: 'Code the Robot', stackingsim: 'Stack It!', pokadif: 'Pokadif', sciencetory: 'Sciencetory',
  artifactory: 'Artifactory', maze: 'Maze', blockdrop: 'Block Drop', popblocks: 'Pop Blocks', doubleup: 'Double Up', hopper: 'Dodgy Hopper', turbo: 'Turbo Trail', pinball: 'Pinball',
  minigames: 'Mini games', snakeast: 'Snakize', slabrall: 'SlaBrall', pyraspike: 'PyraDive', blasoff: 'BlasOff', brawlbuddies: 'Brawl Buddies', soulbopper: 'Soul Bopper',
  alignext: 'Alignext', chess: 'Chess', checkers: 'Checkers', polyplot: 'Polyplot', tdstories: 'TD-Stories', brawenture: 'Brawenture', avateer: 'Avateer', avateerbattle: 'Avateer battles'};
const FAM_ORDER = ['think', 'detective', 'climb', 'sport', 'arena', 'board', 'story'];
const FAM_LABEL = {think: '🧠 Think', detective: '🔬 Lab & detective', climb: '🏃 Arcade', sport: '🏟️ Sport', arena: '🥊 Arena', board: '♟️ Board', story: '📖 Story'};
const FAM_COL = {think: '#DDF1EF', detective: '#E8E4FB', climb: '#FDE3D7', sport: '#FFF1C9', arena: '#FBDCD9', board: '#EFE6DC', story: '#DFF0DA'};
const SCALE_NAME = {pent: 'pentatonic', minpent: 'minor pentatonic', dorian: 'dorian', lydian: 'lydian', major: 'major', minor: 'minor'};
let FAM = 'all', CUR = null, CUR_ID = '', ramp = 0;
// back: names where it goes (◀ Dashboard when there is no trail)
$('back').textContent = UI.backLabel ? UI.backLabel() : '◀ Back';
$('back').onclick = () => { stop(); UI.back ? UI.back() : history.back(); };
// 🎵 this player's music on / off + volume
UISound.music.css();
const paintMus = st => { $('mus').classList.toggle('gb-mus-off', !st.on); $('mus').title = st.on ? 'Music: on' : 'Music: off'; };
paintMus(UISound.music.state()); UISound.music.watch(paintMus);
$('mus').onclick = () => UISound.music.sheet($('mus'));
function renderFams(){
  const box = $('fams'); box.innerHTML = '';
  [['all', '🎵 All']].concat(FAM_ORDER.map(f => [f, FAM_LABEL[f]])).forEach(([k, t]) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'fam' + (FAM === k ? ' on' : ''); b.textContent = t; b.dataset.k = k;
    b.onclick = () => { FAM = k; box.querySelectorAll('.fam').forEach(x => x.classList.toggle('on', x.dataset.k === k)); renderGrid(); };
    box.appendChild(b);
  });
}
function renderGrid(){
  const g = $('grid'); g.innerHTML = '';
  const ids = Object.keys(UISound.MOODS).filter(k => UISound.MOODS[k] && (FAM === 'all' || UISound.MOODS[k].fam === FAM));
  ids.sort((a, b) => FAM_ORDER.indexOf(UISound.MOODS[a].fam) - FAM_ORDER.indexOf(UISound.MOODS[b].fam));
  ids.forEach(k => {
    const R = UISound.MOODS[k], b = document.createElement('button'); b.type = 'button'; b.className = 'card' + (k === CUR_ID ? ' on' : ''); b.dataset.k = k; b.setAttribute('data-sound', 'none');
    b.style.setProperty('--fc', FAM_COL[R.fam] || '#EEE');
    b.innerHTML = '<span class="ic"></span><span class="nm"></span><span class="gm"></span><span class="tg"></span><span class="fb"></span>';
    b.querySelector('.ic').textContent = R.icon; b.querySelector('.nm').textContent = R.name; b.querySelector('.gm').textContent = GAME_OF[k] || k;
    b.querySelector('.tg').textContent = R.key + ' ' + (SCALE_NAME[R.scale] || R.scale) + ' · ' + R.bpm + ' bpm · ' + R.lead;
    b.querySelector('.fb').textContent = (UISound.MOOD_FAMILIES[R.fam] || {}).icon || '';
    b.onclick = () => toggle(k);
    g.appendChild(b);
  });
}
function lit(id, on){ $(id).classList.toggle('lit', !!on); }
function toggle(k){
  UISound.wake && UISound.wake();
  const was = CUR_ID; stop(); if(was === k) return;
  CUR = UISound.mood(k); CUR_ID = k;
  $('ten').value = 0; lit('a-hush', false); lit('a-pause', false); $('a-pause').textContent = '⏸ Pause';
  $('panel').classList.remove('idle');
  const R = UISound.MOODS[k];
  $('now-t').textContent = '▶ ' + R.icon + ' ' + R.name + ' — ' + (GAME_OF[k] || k);
  document.querySelectorAll('.card').forEach(c => c.classList.toggle('on', c.dataset.k === k));
}
function stop(){
  clearInterval(ramp); ramp = 0;
  if(CUR) CUR.stop(); CUR = null; CUR_ID = '';
  $('panel').classList.add('idle'); $('now-t').textContent = '👆 Tap a card to listen'; $('now-l').textContent = ''; $('ten').value = 0;
  document.querySelectorAll('.card').forEach(c => c.classList.remove('on'));
}
$('ten').oninput = e => { if(CUR) CUR.set('tension', e.target.value / 100); };
$('a-hush').onclick = () => { if(!CUR) return; const on = !$('a-hush').classList.contains('lit'); lit('a-hush', on); CUR.hush(on); };
$('a-sfx').onclick = () => UISound.play('success');   // a real UiKit game sound → the music ducks under it
$('a-lift').onclick = () => { if(CUR) CUR.lift(); };
$('a-pause').onclick = () => { if(!CUR) return; const on = !$('a-pause').classList.contains('lit'); lit('a-pause', on); CUR.pause(on); $('a-pause').textContent = on ? '▶ Resume' : '⏸ Pause'; };
$('a-ramp').onclick = () => { if(!CUR) return; clearInterval(ramp); let v = 0; $('ten').value = 0; CUR.set('tension', 0);
  ramp = setInterval(() => { if(!CUR){ clearInterval(ramp); return; } v += 2; $('ten').value = v; CUR.set('tension', v / 100); if(v >= 100) clearInterval(ramp); }, 200); };
$('a-stop').onclick = stop;
// layers line (what is playing right now)
setInterval(() => {
  if(!CUR || !CUR.live){ if(CUR_ID && !(CUR && CUR.why === 'own-music')) $('now-l').textContent = CUR && !CUR.live ? '🔇 (silent here)' : ''; return; }
  const S = CUR.S; $('now-l').textContent = '🎚️ ' + Math.round(S.bpmNow) + ' bpm · ' + (S.paused ? 'paused' : (S.layers || '…'));
}, 250);
renderFams(); renderGrid();
window.MoodLab = {toggle: toggle, stop: stop, cur: () => CUR};
